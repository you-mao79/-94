package com.zom.service;

import com.zom.entity.Role;
import com.zom.entity.RoleBasic;
import com.zom.entity.RoleSkill;
import com.zom.repository.RoleBasicRepository;
import com.zom.repository.RoleRepository;
import com.zom.repository.RoleSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RoleSkillRepository roleSkillRepository;

    @Autowired
    private RoleBasicRepository roleBasicRepository;

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Integer id) {
        return roleRepository.findById(id).orElse(null);
    }

    public Role save(Role role) {
        return roleRepository.save(role);
    }

    public void delete(Integer id) {
        roleRepository.deleteById(id);
    }

    public List<RoleSkill> getSkillsByRoleId(Integer roleId) {
        return roleSkillRepository.findByRoleId(roleId);
    }

    public RoleBasic getBasicByRoleId(Integer roleId) {
        return roleBasicRepository.findByRoleId(roleId);
    }
}