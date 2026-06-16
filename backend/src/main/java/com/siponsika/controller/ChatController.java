package com.siponsika.controller;

import com.siponsika.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private GeminiService geminiService;

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        SseEmitter emitter = new SseEmitter(30000L);

        if (message == null || message.isBlank()) {
            try {
                emitter.send(SseEmitter.event().data("Pesan tidak boleh kosong."));
                emitter.complete();
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        geminiService.streamChatResponse(message)
                .subscribe(
                        text -> {
                            try {
                                emitter.send(SseEmitter.event().data(text));
                            } catch (IOException e) {
                                log.error("Gagal kirim SSE ke client: {}", e.getMessage());
                                emitter.completeWithError(e);
                            }
                        },
                        err -> {
                            log.error("Chat error: {}", err.getMessage());
                            try {
                                emitter.send(SseEmitter.event().data(err.getMessage()));
                            } catch (IOException e) {
                                // ignore
                            }
                            emitter.complete();
                        },
                        emitter::complete
                );

        emitter.onTimeout(() -> {
            log.warn("SseEmitter timeout untuk pesan: {}", message);
            emitter.complete();
        });

        emitter.onError(e -> {
            log.error("SseEmitter error: {}", e.getMessage());
            emitter.complete();
        });

        return emitter;
    }
}
