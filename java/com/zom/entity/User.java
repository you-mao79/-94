package com.zom.entity;

import javax.persistence.*;

@Entity
@Table(name = "sys_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 50, unique = true)
    private String account;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;  // 修复：移除默认值，改为null

    // getter 和 setter
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getTitle() { return null; } // 兼容性方法
    public String getFaction() { return null; } // 兼容性方法
    public String getHeight() { return null; } // 兼容性方法
    public String getWeight() { return null; } // 兼容性方法
    public String getBirthday() { return null; } // 兼容性方法
    public String getLikes() { return null; } // 兼容性方法
    public String getDislikes() { return null; } // 兼容性方法
    public String getBackground() { return null; } // 兼容性方法
}