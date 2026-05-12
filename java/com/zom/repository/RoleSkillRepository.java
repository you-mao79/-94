package com.zom.repository;

import com.zom.entity.RoleSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleSkillRepository extends JpaRepository<RoleSkill, Integer> {
    List<RoleSkill> findByRoleId(Integer roleId);
}