package com.zom.entity;

import javax.persistence.*;

@Entity
@Table(name = "sys_role_basic")
public class RoleBasic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "role_id")
    private Integer roleId;

    private String title;
    private String faction;
    private String height;
    private String weight;
    private String birthday;
    private String likes;
    private String dislikes;
    private String background;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }
}