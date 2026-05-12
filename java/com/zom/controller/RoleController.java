package com.zom.controller;

import com.zom.entity.*;
import com.zom.service.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {
    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    private final RoleService roleService;
    private final String uploadDir;
    private final String staticDir;

    @Autowired
    public RoleController(RoleService roleService,
                          @Value("${file.upload-dir}") String uploadDir) {
        this.roleService = roleService;
        this.uploadDir = uploadDir;
        this.staticDir = "src/main/resources/static";
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.findAll();
    }

    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Integer id) {
        return roleService.findById(id);
    }

    @GetMapping("/{id}/skills")
    public List<RoleSkill> getRoleSkills(@PathVariable Integer id) {
        return roleService.getSkillsByRoleId(id);
    }

    @GetMapping("/{id}/basic")
    public RoleBasic getRoleBasic(@PathVariable Integer id) {
        return roleService.getBasicByRoleId(id);
    }

    @PostMapping
    public Role addRole(@RequestBody Role role) {
        role.setCreateTime(new Date());
        // 确保有默认模型文件
        if (role.getModelFile() == null) {
            role.setModelFile("default.pmx");
        }
        return roleService.save(role);
    }

    @PutMapping("/{id}")
    public Role updateRole(@PathVariable Integer id, @RequestBody Role role) {
        role.setId(id);
        role.setUpdateTime(new Date());
        return roleService.save(role);
    }

    @DeleteMapping("/{id}")
    public void deleteRole(@PathVariable Integer id) {
        roleService.delete(id);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("上传图片文件: {}, 大小: {} bytes",
                    file.getOriginalFilename(),
                    file.getSize());

            // 1. 验证文件类型
            String filename = file.getOriginalFilename();
            if (filename == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "文件名不能为空"));
            }

            String lowerFilename = filename.toLowerCase();
            if (!lowerFilename.endsWith(".jpg") &&
                    !lowerFilename.endsWith(".jpeg") &&
                    !lowerFilename.endsWith(".png") &&
                    !lowerFilename.endsWith(".gif")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "只支持图片格式文件 (JPG, PNG, GIF)"));
            }

            // 2. 创建静态图片目录（确保存在）
            Path staticImageDir = Paths.get(staticDir, "images");
            if (!Files.exists(staticImageDir)) {
                Files.createDirectories(staticImageDir);
                logger.info("创建静态图片目录: {}", staticImageDir.toAbsolutePath());
            }

            // 3. 生成唯一文件名（基于文件内容哈希，避免重复）
            String fileHash = calculateFileHash(file.getBytes());
            String extension = filename.substring(filename.lastIndexOf("."));
            String newFilename = fileHash + extension;

            // 检查文件是否已存在
            Path destination = staticImageDir.resolve(newFilename);
            if (!Files.exists(destination)) {
                // 4. 保存文件到静态目录
                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                logger.info("图片保存到: {}", destination.toAbsolutePath());
            } else {
                logger.info("图片已存在，使用现有文件: {}", newFilename);
            }

            // 5. 返回文件名（前端会添加 /images/ 前缀）
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "filePath", "/images/" + newFilename,
                    "message", "上传成功",
                    "fileName", newFilename  // 只返回文件名
            ));
        } catch (Exception e) {
            logger.error("图片上传失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "上传失败: " + e.getMessage()));
        }
    }
    // 添加计算文件哈希的方法
    private String calculateFileHash(byte[] fileContent) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(fileContent);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            // 如果计算哈希失败，使用UUID
            return UUID.randomUUID().toString();
        }
    }

    @PostMapping("/upload-model")
    public ResponseEntity<Map<String, String>> uploadModel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("roleId") Integer roleId) {

        logger.info("上传模型文件: {}, 大小: {} bytes, 角色ID: {}",
                file.getOriginalFilename(),
                file.getSize(),
                roleId);

        try {
            // 验证文件类型
            String filename = file.getOriginalFilename();
            if (filename == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "文件名不能为空"));
            }

            String lowerFilename = filename.toLowerCase();
            if (!lowerFilename.endsWith(".pmx") && !lowerFilename.endsWith(".fbx")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "只支持PMX和FBX格式文件"));
            }

            // 创建静态模型目录
            Path staticModelDir = Paths.get(staticDir, "models");
            if (!Files.exists(staticModelDir)) {
                Files.createDirectories(staticModelDir);
                logger.info("创建静态模型目录: {}", staticModelDir.toAbsolutePath());
            }

            // 生成文件名：使用角色ID + 时间戳
            String extension = filename.substring(filename.lastIndexOf("."));
            String newFilename = roleId + "_" + System.currentTimeMillis() + extension;

            // 保存到静态目录
            Path staticDestination = staticModelDir.resolve(newFilename);
            Files.copy(file.getInputStream(), staticDestination, StandardCopyOption.REPLACE_EXISTING);
            logger.info("模型保存到: {}", staticDestination.toAbsolutePath());

            // 更新角色关联
            Role role = roleService.findById(roleId);
            if (role != null) {
                // 删除旧模型文件
                if (role.getModelFile() != null && !role.getModelFile().equals("default.pmx")) {
                    try {
                        Path oldModelPath = staticModelDir.resolve(role.getModelFile());
                        if (Files.exists(oldModelPath)) {
                            Files.delete(oldModelPath);
                            logger.info("删除旧模型文件: {}", role.getModelFile());
                        }
                    } catch (IOException e) {
                        logger.warn("删除旧模型文件失败: {}", e.getMessage());
                    }
                }

                role.setModelFile(newFilename);
                role.setUpdateTime(new Date());
                roleService.save(role);
                logger.info("更新角色 {} 的模型文件为: {}", role.getName(), newFilename);

                return ResponseEntity.ok(Map.of(
                        "success", "true",
                        "filePath", "/models/" + newFilename,
                        "message", "模型上传成功",
                        "fileName", newFilename
                ));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "角色不存在"));
            }
        } catch (Exception e) {
            logger.error("上传失败: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "上传失败: " + e.getMessage()));
        }
    }

    // 添加删除模型接口
    @DeleteMapping("/{id}/model")
    public ResponseEntity<Map<String, String>> deleteModel(@PathVariable Integer id) {
        try {
            Role role = roleService.findById(id);
            if (role == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "角色不存在"));
            }

            String modelFile = role.getModelFile();
            if (modelFile != null && !modelFile.equals("default.pmx")) {
                // 删除静态目录中的文件
                Path staticModelDir = Paths.get(staticDir, "models");
                Path modelPath = staticModelDir.resolve(modelFile);

                if (Files.exists(modelPath)) {
                    Files.delete(modelPath);
                    logger.info("删除模型文件: {}", modelPath.toAbsolutePath());
                }

                // 更新数据库
                role.setModelFile("default.pmx");
                role.setUpdateTime(new Date());
                roleService.save(role);
            }

            return ResponseEntity.ok(Map.of("success", "true", "message", "模型删除成功"));
        } catch (Exception e) {
            logger.error("删除模型失败: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "删除失败: " + e.getMessage()));
        }
    }
    @GetMapping("/check-model/{roleId}")
    public ResponseEntity<Map<String, Object>> checkModel(@PathVariable Integer roleId) {
        try {
            Role role = roleService.findById(roleId);
            if (role == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", "false", "message", "角色不存在"));
            }

            Map<String, Object> result = new HashMap<>();
            result.put("roleId", roleId);
            result.put("roleName", role.getName());
            result.put("modelFile", role.getModelFile());

            // 检查模型文件是否存在
            if (role.getModelFile() != null && !role.getModelFile().equals("default.pmx")) {
                // 检查静态目录
                Path staticModelPath = Paths.get(staticDir, "models", role.getModelFile());
                boolean staticExists = Files.exists(staticModelPath);

                // 检查上传目录
                Path uploadModelPath = Paths.get(uploadDir, "models", role.getModelFile());
                boolean uploadExists = Files.exists(uploadModelPath);

                result.put("staticExists", staticExists);
                result.put("staticPath", staticModelPath.toAbsolutePath().toString());
                result.put("uploadExists", uploadExists);
                result.put("uploadPath", uploadModelPath.toAbsolutePath().toString());

                if (staticExists || uploadExists) {
                    Path filePath = staticExists ? staticModelPath : uploadModelPath;
                    result.put("fileSize", Files.size(filePath));
                    result.put("lastModified", Files.getLastModifiedTime(filePath).toMillis());
                    result.put("accessibleUrl", "/models/" + role.getModelFile());

                    // 测试URL是否可访问
                    try {
                        String testUrl = "http://localhost:8091/models/" + role.getModelFile();
                        java.net.URL url = new java.net.URL(testUrl);
                        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
                        connection.setRequestMethod("HEAD");
                        connection.setConnectTimeout(3000);
                        int responseCode = connection.getResponseCode();
                        result.put("httpAccessible", responseCode == 200);
                    } catch (Exception e) {
                        result.put("httpAccessible", false);
                        result.put("httpError", e.getMessage());
                    }
                }
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("检查模型失败: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "检查失败: " + e.getMessage()));
        }
    }

    // 添加获取所有模型文件的接口
    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> listAllModels() {
        try {
            Map<String, Object> result = new HashMap<>();

            // 检查静态目录
            Path staticModelsDir = Paths.get(staticDir, "models");
            List<String> staticFiles = new ArrayList<>();

            if (Files.exists(staticModelsDir)) {
                Files.list(staticModelsDir)
                        .filter(path -> !Files.isDirectory(path))
                        .forEach(path -> staticFiles.add(path.getFileName().toString()));
            }

            result.put("staticModelsDir", staticModelsDir.toAbsolutePath().toString());
            result.put("staticFiles", staticFiles);
            result.put("totalStaticFiles", staticFiles.size());

            // 检查上传目录
            Path uploadModelsDir = Paths.get(uploadDir, "models");
            List<String> uploadFiles = new ArrayList<>();

            if (Files.exists(uploadModelsDir)) {
                Files.list(uploadModelsDir)
                        .filter(path -> !Files.isDirectory(path))
                        .forEach(path -> uploadFiles.add(path.getFileName().toString()));
            }

            result.put("uploadModelsDir", uploadModelsDir.toAbsolutePath().toString());
            result.put("uploadFiles", uploadFiles);
            result.put("totalUploadFiles", uploadFiles.size());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("列出模型文件失败: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", "false", "message", "列出失败: " + e.getMessage()));
        }
    }

}