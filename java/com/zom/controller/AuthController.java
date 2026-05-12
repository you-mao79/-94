package com.zom.controller;

import com.zom.entity.User;
import com.zom.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        System.out.println("接收到登录请求 - 账号: " + user.getAccount()); // 添加日志

        Map<String, Object> response = new HashMap<>();
        User dbUser = userRepository.findByAccount(user.getAccount());

        System.out.println("数据库查询结果: " + (dbUser != null ? "找到用户" : "用户不存在"));

        if (dbUser != null && dbUser.getPassword().equals(user.getPassword())) {
            // 登录成功
            System.out.println("密码验证成功");
            response.put("success", true);
            response.put("message", "登录成功");
            response.put("username", dbUser.getUsername());
            response.put("account", dbUser.getAccount());
            response.put("userId", dbUser.getId());
            response.put("token", "demo_token_" + System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } else {
            // 登录失败
            System.out.println("登录失败 - 用户不存在或密码错误");
            response.put("success", false);
            response.put("message", "账号或密码错误");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkLogin(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();
        // 简单检查，实际应该验证token有效性
        response.put("isValid", token != null && token.startsWith("demo_token"));
        response.put("username", "绮哟哟");
        return ResponseEntity.ok(response);
    }
}