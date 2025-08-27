package akl.p4p.uoa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class GlobalCorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                                "https://probeable-problems-837455747674.australia-southeast1.run.app",
                                "*"
                        )
                        .allowedMethods("*")   
                        .allowedHeaders("*")    
                        .allowCredentials(false);
            }
        };
    }
}
