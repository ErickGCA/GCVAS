package com.example.gcvas.models.Enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class TipoUserConverter implements AttributeConverter<TipoUser, Integer> {

    @Override
    public Integer convertToDatabaseColumn(TipoUser attribute) {
        if (attribute == null)
            return null;

        switch (attribute) {
            case ADM -> {
                return 0;
            }
            case SECRETARIA -> {
                return 1;
            }
            case OUTROS -> {
                return 2;
            }
            case ASSISTENTE -> {
                return 3;
            }
            default -> throw new IllegalArgumentException(attribute + " not supported.");
        }
    }

    @Override
    public TipoUser convertToEntityAttribute(Integer dbData) {
        if (dbData == null)
            return null;

        switch (dbData) {
            case 0 -> {
                return TipoUser.ADM;
            }
            case 1 -> {
                return TipoUser.SECRETARIA;
            }
            case 2 -> {
                return TipoUser.OUTROS;
            }
            case 3 -> {
                return TipoUser.ASSISTENTE;
            }
            default -> throw new IllegalArgumentException(dbData + " not supported.");
        }
    }
}