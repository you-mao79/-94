package com.zom.entity;

import javax.persistence.*;

@Entity
@Table(name = "sys_role_skill")
public class RoleSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "role_id")
    private Integer roleId;

    private String name;
    private String description;
    private String effect;
    private String cooldown;
    private String cost;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }
}

