package com.kwan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.api.embedding-model}")
    private String model;

    private final OkHttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    public EmbeddingService(OkHttpClient http) {
        this.http = http;
    }

    public float[] embed(String text) throws IOException {
        String url = baseUrl + "/models/" + model + ":embedContent";
        String body = mapper.writeValueAsString(Map.of(
                "model", "models/" + model,
                "content", Map.of("parts", List.of(Map.of("text", text))),
                "outputDimensionality", 768
        ));

        Request request = new Request.Builder()
                .url(url)
                .header("x-goog-api-key", apiKey)
                .post(RequestBody.create(body, JSON))
                .build();

        try (Response response = http.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Gemini embedding failed: " + response.code() + " " + response.message());
            }
            JsonNode root = mapper.readTree(response.body().string());
            JsonNode values = root.path("embedding").path("values");
            float[] result = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                result[i] = (float) values.get(i).asDouble();
            }
            log.debug("Embedded {} chars -> {}d vector", text.length(), result.length);
            return result;
        }
    }

    public String toVectorString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            sb.append(embedding[i]);
            if (i < embedding.length - 1) sb.append(",");
        }
        return sb.append("]").toString();
    }
}
