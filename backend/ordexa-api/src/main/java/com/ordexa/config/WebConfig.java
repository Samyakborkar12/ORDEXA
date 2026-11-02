package com.ordexa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        File frontendDir = new File("frontend");
        if (!frontendDir.exists()) {
            frontendDir = new File("../frontend");
        }
        if (!frontendDir.exists()) {
            frontendDir = new File("../../frontend");
        }
        String frontendUri = frontendDir.getAbsoluteFile().toURI().toString();

        registry.addResourceHandler("/**")
                .addResourceLocations(frontendUri, "file:frontend/", "file:../frontend/", "file:../../frontend/");
    }

    @Override
    public void addViewControllers(org.springframework.web.servlet.config.annotation.ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/admin-web").setViewName("redirect:/admin-web/index.html");
        registry.addViewController("/admin-web/").setViewName("forward:/admin-web/index.html");
        registry.addViewController("/customer-app").setViewName("redirect:/customer-app/index.html");
        registry.addViewController("/customer-app/").setViewName("forward:/customer-app/index.html");
    }
}
