package com.zom.controller;

import com.zom.entity.User;
import com.zom.service.UserService;
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
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // 获取用户信息
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Integer id) {
        User user = userService.findById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "用户不存在");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // 更新用户信息
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User userData) {
        User user = userService.findById(id);
        if (user != null) {
            user.setUsername(userData.getUsername());
            user.setAccount(userData.getAccount());
            if (userData.getAvatarUrl() != null) {
                user.setAvatarUrl(userData.getAvatarUrl());
            }
            userService.update(user);
            return ResponseEntity.ok(user);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "用户不存在");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    // 上传头像
    @PostMapping("/{id}/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {

        System.out.println("=== 开始上传头像 ===");
        System.out.println("用户ID: " + id);
        System.out.println("文件名: " + file.getOriginalFilename());
        System.out.println("文件大小: " + file.getSize());

        try {
            // 验证文件类型
            String contentType = file.getContentType();
            System.out.println("文件类型: " + contentType);

            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("错误：不是图片文件");
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "只能上传图片文件");
                return ResponseEntity.badRequest().body(response);
            }

            // 检查文件大小（5MB限制）
            if (file.getSize() > 5 * 1024 * 1024) {
                System.out.println("错误：文件过大");
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "文件大小不能超过5MB");
                return ResponseEntity.badRequest().body(response);
            }

            // 确保用户存在
            User user = userService.findById(id);
            if (user == null) {
                System.out.println("错误：用户不存在");
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // 创建头像目录
            Path avatarDir = Paths.get(uploadDir, "avatars");
            System.out.println("头像目录: " + avatarDir.toAbsolutePath());

            if (!Files.exists(avatarDir)) {
                Files.createDirectories(avatarDir);
                System.out.println("创建头像目录成功");
            }

            // 生成唯一的文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            System.out.println("新文件名: " + newFilename);

            // 保存文件
            Path filePath = avatarDir.resolve(newFilename);
            System.out.println("文件保存路径: " + filePath.toAbsolutePath());

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("文件保存成功");

            // 生成访问URL
            String avatarUrl = "/avatars/" + newFilename;
            System.out.println("头像URL: " + avatarUrl);

            // 更新用户头像信息
            user.setAvatarUrl(avatarUrl);
            userService.update(user);
            System.out.println("数据库更新成功");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "头像上传成功");
            response.put("avatarUrl", avatarUrl);
            response.put("username", user.getUsername());
            response.put("userId", user.getId());

            System.out.println("=== 头像上传完成 ===");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("头像上传异常: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "头像上传失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 更新用户密码
    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Integer id,
            @RequestBody Map<String, String> passwordData) {
        User user = userService.findById(id);
        if (user == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "用户不存在");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        // 验证当前密码
        if (!user.getPassword().equals(currentPassword)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "当前密码错误");
            return ResponseEntity.badRequest().body(response);
        }

        // 更新密码
        user.setPassword(newPassword);
        userService.update(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "密码修改成功");
        return ResponseEntity.ok(response);
    }
}