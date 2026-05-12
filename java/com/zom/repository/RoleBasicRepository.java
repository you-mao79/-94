package com.zom.repository;

import com.zom.entity.RoleBasic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleBasicRepository extends JpaRepository<RoleBasic, Integer> {
    RoleBasic findByRoleId(Integer roleId);
}