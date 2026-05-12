package com.zom.repository;

import com.zom.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Integer> { // 改为Integer类型
}