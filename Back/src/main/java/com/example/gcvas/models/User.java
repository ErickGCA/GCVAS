package com.example.gcvas.models;

import com.example.gcvas.models.Enums.TipoUser;
import com.example.gcvas.models.Enums.TipoUserConverter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = User.TABLENAME)
@NoArgsConstructor
@AllArgsConstructor
@Data
public class User {
    public static final String TABLENAME = "usuario";

    @Id
    @Column(name = "cod_usuario")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login", unique = true, nullable = false, updatable = true, length = 30)
    @NotBlank
    @Size(min = 5, max = 30)
    private String username;

    @Column(name = "password", nullable = false, updatable = true)
    @NotBlank
    @JsonProperty(access = Access.WRITE_ONLY)
    private String password;

    @Convert(converter = TipoUserConverter.class)
    @Column(name = "profile", nullable = false)
    private TipoUser profile;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}