package com.zom.entity;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "sys_role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String attributes;

    @Column(name = "create_time", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createTime;

    @Column(name = "model_file", length = 255)
    private String modelFile;

    @Column(name = "update_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateTime;

    // 字段
    private Integer level;
    private Integer hp;
    private Integer defense;
    private String critRate;
    private Integer abnormalMastery;
    private String wearRate;
    private String attribute;
    private String attackType;

    // getter和setter

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAttributes() { return attributes; }
    public void setAttributes(String attributes) { this.attributes = attributes; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Integer getHp() { return hp; }
    public void setHp(Integer hp) { this.hp = hp; }
    public Integer getDefense() { return defense; }
    public void setDefense(Integer defense) { this.defense = defense; }
    public String getCritRate() { return critRate; }
    public void setCritRate(String critRate) { this.critRate = critRate; }
    public Integer getAbnormalMastery() { return abnormalMastery; }
    public void setAbnormalMastery(Integer abnormalMastery) { this.abnormalMastery = abnormalMastery; }
    public String getWearRate() { return wearRate; }
    public void setWearRate(String wearRate) { this.wearRate = wearRate; }
    public String getAttribute() { return attribute; }
    public void setAttribute(String attribute) { this.attribute = attribute; }
    public String getAttackType() { return attackType; }
    public void setAttackType(String attackType) { this.attackType = attackType; }
    public String getModelFile() { return modelFile; }
    public void setModelFile(String modelFile) { this.modelFile = modelFile; }
}