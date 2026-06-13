package org.example.repository;

import org.example.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findAllBySharedUsersId(Long sharedUserId);

    @Query("SELECT n FROM Note n JOIN n.sharedUsers u WHERE n.id = :id AND u.id = :userId")
    Optional<Note> findSharedNoteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    Optional<Note> findByIdAndOwnerId(Long id, Long ownerId);

    List<Note> findAllByOwnerId(Long ownerId);

    @Query("SELECT DISTINCT n FROM Note n " +
            "LEFT JOIN FETCH n.categories c " +
            "WHERE c.id IN :ids AND n.owner.id = :ownerId")
    List<Note> findAllByCategoriesIdsIn(@Param("ids") List<Long> ids, @Param("ownerId") Long ownerId);

    @Modifying
    @Query(value =
            "DELETE FROM note_categories " +
            "WHERE category_id = :categoryId",
            nativeQuery = true)
    void deleteCategoryAssociations(@Param("categoryId") Long categoryId);
}
