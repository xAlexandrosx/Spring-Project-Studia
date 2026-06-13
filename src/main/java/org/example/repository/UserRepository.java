package org.example.repository;

import org.example.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLogin(String login); // needed for user details service

    Optional<User> findUserById(Long id);

    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.login = :login")
    Optional<User> findByLoginWithRoles(@Param("login") String login);
}
