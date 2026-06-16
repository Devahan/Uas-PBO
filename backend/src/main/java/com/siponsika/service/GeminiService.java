package com.siponsika.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient;
    private final ObjectMapper mapper;

    public GeminiService() {
        this.webClient = WebClient.builder().build();
        this.mapper = new ObjectMapper();
    }

    public Flux<String> streamChatResponse(String userMessage) {
        if (apiKey == null || apiKey.equals("YOUR_GEMINI_API_KEY") || apiKey.isEmpty()) {
            return Flux.just("Peringatan: API Key Gemini belum diatur di backend.");
        }

        String fullUrl = apiUrl + "?key=" + apiKey + "&alt=sse";

        String systemPrompt = "Anda adalah SIPONSIKA AI, asisten Manajemen Darurat dan Logistik. " +
                "Bantu koordinator lapangan menganalisis data logistik, memantau pengungsi, memprediksi kebutuhan. " +
                "Gunakan bahasa profesional, informatif, dan ringkas.\n\nPertanyaan: " + userMessage;

        Map<String, Object> parts = new HashMap<>();
        parts.put("text", systemPrompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(parts));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        log.info("Mengirim request ke Gemini API: {}", apiUrl);

        return webClient.post()
                .uri(fullUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response -> {
                    log.error("Gemini API error: status={}", response.statusCode());
                    return response.bodyToMono(String.class).flatMap(body -> {
                        log.error("Gemini API error body: {}", body);
                        String msg = "Error dari server AI (" + response.statusCode() + ").";
                        return reactor.core.publisher.Mono.error(new RuntimeException(msg));
                    });
                })
                .bodyToFlux(DataBuffer.class)
                .map(buf -> {
                    byte[] bytes = new byte[buf.readableByteCount()];
                    buf.read(bytes);
                    DataBufferUtils.release(buf);
                    return new String(bytes, StandardCharsets.UTF_8);
                })
                .flatMap(chunk -> Flux.fromArray(chunk.split("\n")))
                .filter(line -> line.startsWith("data: "))
                .map(line -> line.substring(6).trim())
                .filter(json -> !json.equals("[DONE]"))
                .map(this::extractText)
                .filter(text -> !text.isEmpty())
                .doOnError(e -> log.error("GeminiService error: {}", e.getMessage()))
                .onErrorResume(e -> {
                    String msg = e.getMessage();
                    if (msg == null || msg.isBlank()) msg = "Gagal terhubung ke server AI. Periksa koneksi internet dan API key.";
                    return Flux.just(msg);
                });
    }

    private String extractText(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode textNode = root.path("candidates")
                    .get(0).path("content")
                    .path("parts").get(0)
                    .path("text");
            return textNode.asText();
        } catch (Exception e) {
            log.warn("Gagal parse JSON dari Gemini: {}", e.getMessage());
            return "";
        }
    }
}
