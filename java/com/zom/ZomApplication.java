package com.zom;

import com.zom.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@SpringBootApplication
@RestController
public class ZomApplication {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path uploadPath; // 添加类级别的uploadPath变量

    public static void main(String[] args) {
        SpringApplication.run(ZomApplication.class, args);
    }

    /**
     * 处理根路径和index页面的控制器方法
     */
    @GetMapping(value = {"/", "/index", "/index.html"})
    public ResponseEntity<Void> handleRootPath() {
        System.out.println("🔄 处理根路径重定向到登录页");
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/login.html"))
                .build();
    }

    /**
     * 用于健康检查，确认应用是否启动
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("timestamp", new Date());
        result.put("service", "ZOM Role Management System");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/home")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("角色管理系统主页 - 请访问 <a href='/login.html'>登录页面</a>");
    }

    /**
     * 初始化系统目录
     */
    @PostConstruct
    public void init() {
        try {
            System.out.println("==========================================");
            System.out.println("🚀 初始化系统目录");
            System.out.println("==========================================");

            // 1. 创建上传根目录
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize(); // 保存到类变量
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ 创建上传根目录: " + uploadPath);
            }

            // 2. 创建上传子目录
            String[] uploadSubDirs = {"images", "models", "avatars"};
            for (String subDir : uploadSubDirs) {
                Path subDirPath = uploadPath.resolve(subDir);
                if (!Files.exists(subDirPath)) {
                    Files.createDirectories(subDirPath);
                    System.out.println("✅ 创建上传子目录: " + subDirPath);
                }
            }

            // 3. 创建静态资源目录
            Path staticDir = Paths.get("src/main/resources/static");
            if (!Files.exists(staticDir)) {
                Files.createDirectories(staticDir);
                System.out.println("✅ 创建静态资源目录: " + staticDir.toAbsolutePath());
            }

            // 4. 创建静态子目录
            String[] staticSubDirs = {"images", "models", "css", "js"};
            for (String subDir : staticSubDirs) {
                Path subDirPath = staticDir.resolve(subDir);
                if (!Files.exists(subDirPath)) {
                    Files.createDirectories(subDirPath);
                    System.out.println("✅ 创建静态子目录: " + subDirPath.toAbsolutePath());
                }
            }

            // 5. 检查目录状态
            checkAndLogDirectoryStatus();

            System.out.println("==========================================\n");

        } catch (IOException e) {
            System.err.println("❌ 创建目录失败: " + e.getMessage());
            // 使用日志而不是printStackTrace
            e.printStackTrace(); // 保留，因为这是初始化错误
        }
    }

    /**
     * 检查并记录目录状态
     */
    private void checkAndLogDirectoryStatus() {
        System.out.println("\n📁 检查目录状态:");

        // 检查上传目录
        if (uploadPath != null) {
            checkDirectory("上传根目录", uploadPath.toString());

            String[] uploadSubDirs = {"images", "models", "avatars"};
            for (String subDir : uploadSubDirs) {
                Path subDirPath = uploadPath.resolve(subDir);
                checkDirectory("上传" + subDir + "目录", subDirPath.toString());
            }
        }

        // 检查静态目录
        Path staticDir = Paths.get("src/main/resources/static");
        checkDirectory("静态资源目录", staticDir.toString());

        String[] staticSubDirs = {"images", "models", "css", "js"};
        for (String subDir : staticSubDirs) {
            Path subDirPath = staticDir.resolve(subDir);
            checkDirectory("静态" + subDir + "目录", subDirPath.toString());
        }

        System.out.println("==========================================");
    }

    /**
     * 检查单个目录
     */
    private void checkDirectory(String name, String pathStr) {
        try {
            Path path = Paths.get(pathStr).toAbsolutePath().normalize();
            if (Files.exists(path)) {
                System.out.println("✅ " + name + " 存在: " + path);
            } else {
                System.out.println("❌ " + name + " 不存在: " + path);
            }
        } catch (Exception e) {
            System.err.println("⚠️ 检查" + name + "时出错: " + e.getMessage());
        }
    }

    /**
     * 测试数据库连接
     */
    @Bean
    public CommandLineRunner testDB(RoleRepository repo) {
        return args -> {
            System.out.println("----- 测试数据库连接 -----");
            try {
                long count = repo.count();
                System.out.println("✅ 数据库连接正常，角色数量: " + count);
            } catch (Exception e) {
                System.err.println("❌ 数据库连接失败: " + e.getMessage());
            }
        };
    }

    /**
     * 统一的Web MVC配置
     */
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {

            /**
             * 配置视图控制器，确保根路径重定向
             */
            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                // 将根路径重定向到登录页
                registry.addViewController("/").setViewName("redirect:/login.html");
                registry.addViewController("/index").setViewName("redirect:/login.html");
                registry.addViewController("/index.html").setViewName("redirect:/login.html");

                System.out.println("✅ 配置视图控制器: / -> /login.html");
            }

            /**
             * 配置静态资源映射 - 确保不拦截控制器处理的路径
             */
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                System.out.println("==========================================");
                System.out.println("📂 配置静态资源映射");
                System.out.println("==========================================");

                // 获取项目根目录路径
                String projectRoot = System.getProperty("user.dir");
                System.out.println("项目根目录: " + projectRoot);

                // 检查静态模型目录
                Path staticModelsPath = Paths.get("src/main/resources/static/models");
                System.out.println("静态模型目录: " + staticModelsPath.toAbsolutePath());
                System.out.println("是否存在: " + Files.exists(staticModelsPath));

                // 列出模型文件 - 使用 try-with-resources 修复资源泄漏问题
                try (java.util.stream.Stream<Path> fileStream = Files.list(staticModelsPath)) {
                    if (Files.exists(staticModelsPath)) {
                        List<Path> modelFiles = fileStream
                                .filter(path -> !Files.isDirectory(path))
                                .collect(Collectors.toList());
                        System.out.println("找到 " + modelFiles.size() + " 个模型文件:");
                        modelFiles.forEach(file ->
                                System.out.println("  - " + file.getFileName()));
                    }
                } catch (IOException e) {
                    System.err.println("无法列出模型文件: " + e.getMessage());
                }

                // ========== 配置资源处理器 ==========

                // 1. 模型文件访问路径 (/models/**)
                System.out.println("\n配置模型资源处理器:");
                System.out.println("classpath:/static/models/");

                registry.addResourceHandler("/models/**")
                        .addResourceLocations(
                                "classpath:/static/models/",
                                "file:" + staticModelsPath.toAbsolutePath() + "/"
                        )
                        .setCachePeriod(0) // 开发环境不缓存
                        .resourceChain(true)
                        .addResolver(new PathResourceResolver() {
                            @Override
                            protected Resource getResource(String resourcePath, Resource location) throws IOException {
                                Resource resource = location.createRelative(resourcePath);
                                if (resource.exists() && resource.isReadable()) {
                                    System.out.println("✅ 找到模型文件: " + resourcePath);
                                    return resource;
                                } else {
                                    System.out.println("❌ 未找到模型文件: " + resourcePath);
                                }
                                return null;
                            }
                        });

                // 2. 图片访问路径 (/images/**)
                String staticImagesPath = "classpath:/static/images/";
                String uploadImagesPath = "file:" + uploadPath + "/images/"; // 使用类变量
                System.out.println("图片路径 -> " + staticImagesPath + ", " + uploadImagesPath);

                registry.addResourceHandler("/images/**")
                        .addResourceLocations(uploadImagesPath, staticImagesPath)
                        .setCachePeriod(3600);

                // 3. 头像访问路径 (/avatars/**)
                String avatarsPath = "file:" + uploadPath + "/avatars/"; // 使用类变量
                System.out.println("头像路径 -> " + avatarsPath);

                registry.addResourceHandler("/avatars/**")
                        .addResourceLocations(avatarsPath)
                        .setCachePeriod(3600);

                // 4. CSS和JS文件 (/css/**, /js/**)
                registry.addResourceHandler("/css/**")
                        .addResourceLocations("classpath:/static/css/")
                        .setCachePeriod(3600);

                registry.addResourceHandler("/js/**")
                        .addResourceLocations("classpath:/static/js/")
                        .setCachePeriod(3600);

                // 5. 静态HTML页面 - 简化处理
                registry.addResourceHandler("/*.html")
                        .addResourceLocations("classpath:/static/")
                        .setCachePeriod(0);

                // 6. 其他静态资源
                registry.addResourceHandler("/**")
                        .addResourceLocations(
                                "classpath:/static/",
                                "classpath:/public/",
                                "classpath:/META-INF/resources/"
                        )
                        .setCachePeriod(0);

                System.out.println("✅ 静态资源配置完成");
                System.out.println("==========================================\n");
            }

            /**
             * 配置CORS跨域
             */
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
                System.out.println("✅ CORS配置完成: 允许所有跨域请求");
            }
        };
    }

    /**
     * 检查模型文件的API端点
     */
    @GetMapping("/check-model/{filename}")
    public ResponseEntity<Map<String, Object>> checkModelFile(@PathVariable String filename) {
        try {
            Map<String, Object> result = new HashMap<>();

            // 检查静态目录
            Path staticPath = Paths.get("src/main/resources/static/models", filename);
            boolean staticExists = Files.exists(staticPath);

            // 检查上传目录
            Path uploadModelPath = Paths.get(uploadDir, "models", filename);
            boolean uploadExists = Files.exists(uploadModelPath);

            result.put("filename", filename);
            result.put("staticExists", staticExists);
            result.put("staticPath", staticPath.toAbsolutePath().toString());
            result.put("uploadExists", uploadExists);
            result.put("uploadPath", uploadModelPath.toAbsolutePath().toString());
            result.put("accessible", staticExists || uploadExists);

            if (staticExists || uploadExists) {
                Path filePath = staticExists ? staticPath : uploadModelPath;
                result.put("fileSize", Files.size(filePath));
                result.put("lastModified", new Date(Files.getLastModifiedTime(filePath).toMillis()));
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", new Date());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 系统信息API
     */
    @GetMapping("/api/system/info")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();

        info.put("appName", "ZOM Role Management System");
        info.put("version", "1.0.0");
        info.put("timestamp", new Date());
        info.put("uploadDir", uploadDir);

        // 检查目录状态
        Map<String, Boolean> dirStatus = new HashMap<>();
        if (uploadPath != null) {
            dirStatus.put("uploadRoot", Files.exists(uploadPath));
        } else {
            dirStatus.put("uploadRoot", false);
        }
        dirStatus.put("staticRoot", Files.exists(Paths.get("src/main/resources/static")));

        info.put("directoryStatus", dirStatus);

        return ResponseEntity.ok(info);
    }

    /**
     * 调试端点：列出所有模型文件
     */
    @GetMapping("/debug/models")
    public ResponseEntity<List<Map<String, Object>>> debugModels() {
        try {
            List<Map<String, Object>> results = new ArrayList<>();

            // 检查 classpath 中的 models
            ClassPathResource classpathResource = new ClassPathResource("static/models/");
            if (classpathResource.exists()) {
                PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
                Resource[] resources = resolver.getResources("classpath:static/models/*");

                for (Resource resource : resources) {
                    if (resource.isReadable()) {
                        Map<String, Object> info = new HashMap<>();
                        info.put("source", "classpath");
                        info.put("filename", resource.getFilename());
                        info.put("url", "/models/" + resource.getFilename());
                        try {
                            info.put("size", resource.contentLength());
                        } catch (IOException e) {
                            info.put("size", "unknown");
                        }
                        results.add(info);
                    }
                }
            }

            // 检查文件系统中的 models
            Path staticModelsPath = Paths.get("src/main/resources/static/models");
            if (Files.exists(staticModelsPath)) {
                try (java.util.stream.Stream<Path> fileStream = Files.list(staticModelsPath)) {
                    fileStream.filter(path -> !Files.isDirectory(path))
                            .forEach(path -> {
                                try {
                                    Map<String, Object> info = new HashMap<>();
                                    info.put("source", "filesystem");
                                    info.put("filename", path.getFileName().toString());
                                    info.put("path", path.toAbsolutePath().toString());
                                    info.put("size", Files.size(path));
                                    info.put("url", "/models/" + path.getFileName().toString());
                                    results.add(info);
                                } catch (IOException e) {
                                    // 忽略单个文件的错误
                                }
                            });
                }
            }

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(
                            Map.of("error", e.getMessage())
                    ));
        }
    }

    /**
     * 简单的测试端点，用于验证模型文件访问
     */
    @GetMapping("/test-model/{filename}")
    public ResponseEntity<Map<String, Object>> testModelFile(@PathVariable String filename) {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("filename", filename);

            // 尝试访问文件
            String url = "/models/" + filename;
            result.put("testUrl", url);

            // 测试HTTP访问
            try {
                java.net.URL testUrl = new java.net.URI("http://localhost:8091" + url).toURL();
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) testUrl.openConnection();
                conn.setRequestMethod("HEAD");
                conn.setConnectTimeout(3000);
                int responseCode = conn.getResponseCode();
                result.put("httpResponseCode", responseCode);
                result.put("httpAccessible", responseCode == 200);
                result.put("contentLength", conn.getContentLength());
                result.put("contentType", conn.getContentType());
            } catch (Exception e) {
                result.put("httpAccessible", false);
                result.put("httpError", e.getMessage());
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}