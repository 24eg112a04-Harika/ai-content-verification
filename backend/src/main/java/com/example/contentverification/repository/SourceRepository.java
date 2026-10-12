package com.example.contentverification.repository;

import com.example.contentverification.entity.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SourceRepository extends JpaRepository<Source, Long> {

    Optional<Source> findByUrl(String url);

    List<Source> findTop20ByOrderByRetrievedAtDesc();

    @Query("SELECT s FROM Source s WHERE (:query IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(COALESCE(s.publisher, '')) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.url) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY s.retrievedAt DESC")
    List<Source> searchSources(@Param("query") String query);
}
