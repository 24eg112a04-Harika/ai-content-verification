package com.example.contentverification.repository;

import com.example.contentverification.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByAccountStatus(com.example.contentverification.enums.AccountStatus accountStatus);
}
