package com.zom.service;

import com.zom.entity.User;
import com.zom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public User findById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByAccount(String account) {
        return userRepository.findByAccount(account);
    }

    public User update(User user) {
        return userRepository.save(user);
    }

    public String uploadAvatar(Integer userId, MultipartFile file) throws IOException{
        // 创建头像目录
        Path avatarDir = Paths.get(uploadDir, "avatars");
        if (!Files.exists(avatarDir)) {
            Files.createDirectories(avatarDir);
        }

        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID() + extension;

        // 保存文件
        Path targetPath = avatarDir.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 返回相对路径
        return "/avatars/" + filename;
    }
}