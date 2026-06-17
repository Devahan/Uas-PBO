package com.siponsika.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private static final Logger log = LoggerFactory.getLogger(GroqService.class);

    @Value("${GROQ_API_KEY:YOUR_GROQ_API_KEY}")
    private String apiKey;

    private final String apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    private final WebClient webClient;
    private final ObjectMapper mapper;

    public GroqService() {
        this.webClient = WebClient.builder().build();
        this.mapper = new ObjectMapper();
    }

    public Flux<String> streamChatResponse(String userMessage) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("YOUR_GROQ_API_KEY")) {
            return Flux.just("Peringatan: API Key Groq belum diatur di backend.");
        }

        String systemPrompt = "Anda adalah SIPONSIKA AI, asisten Manajemen Darurat dan Logistik. " +
                "Bantu koordinator lapangan menganalisis data logistik, memantau pengungsi, memprediksi kebutuhan. " +
                "Gunakan bahasa profesional, informatif, dan ringkas.";

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        messages.add(systemMsg);

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messages.add(userMsg);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.1-8b-instant");
        requestBody.put("messages", messages);
        requestBody.put("stream", true);

        log.info("Mengirim request ke Groq API: {}", apiUrl);

        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response -> {
                    log.error("Groq API error: status={}", response.statusCode());
                    return response.bodyToMono(String.class).flatMap(body -> {
                        log.error("Groq API error body: {}", body);
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
                .doOnError(e -> log.error("GroqService error: {}", e.getMessage()))
                .onErrorResume(e -> {
                    String msg = e.getMessage();
                    if (msg == null || msg.isBlank())
                        msg = "Gagal terhubung ke server AI. Periksa koneksi internet dan API key.";
                    return Flux.just(msg);
                });
    }

    private String extractText(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode delta = choices.get(0).path("delta");
                if (delta.has("content")) {
                    return delta.path("content").asText();
                }
            }
            return "";
        } catch (Exception e) {
            log.warn("Gagal parse JSON dari Groq: {}", e.getMessage());
            return "";
        }
    }
}
