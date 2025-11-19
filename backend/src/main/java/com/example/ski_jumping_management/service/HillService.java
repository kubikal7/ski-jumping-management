package com.example.ski_jumping_management.service;

import com.example.ski_jumping_management.exceptions.BadRequestException;
import com.example.ski_jumping_management.model.Hill;
import com.example.ski_jumping_management.repository.EventRepository;
import com.example.ski_jumping_management.repository.HillRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HillService {

    private final HillRepository hillRepository;
    private final EventRepository eventRepository;

    public Page<Hill> getHills(
            String name,
            String city,
            String country,
            Short minHillSize,
            Short maxHillSize,
            Short minKPoint,
            Short maxKPoint,
            BigDecimal latitude,
            BigDecimal longitude,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {

        Sort sort;

        if (sortBy == null || sortBy.isEmpty()) {
            sort = Sort.by(Sort.Direction.ASC, "name");
        } else {
            Sort.Direction direction = Sort.Direction.fromOptionalString(sortDirection).orElse(Sort.Direction.ASC);
            sort = Sort.by(direction, sortBy);
        }
        Pageable pageable = PageRequest.of(page, size, sort);
        return hillRepository.findHills(
                name, city, country,
                minHillSize, maxHillSize,
                minKPoint, maxKPoint,
                latitude, longitude,
                pageable
        );
    }

    public Hill getHill(Integer id) {
        return hillRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hill not found"));
    }

    public Hill createHill(Hill hill) {
        return hillRepository.save(hill);
    }

    public Hill updateHill(Integer id, Hill hillDetails) {
        Hill hill = hillRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hill not found"));

        hill.setName(hillDetails.getName());
        hill.setCity(hillDetails.getCity());
        hill.setCountry(hillDetails.getCountry());
        hill.setHillSize(hillDetails.getHillSize());
        hill.setConstructionPoint(hillDetails.getConstructionPoint());
        hill.setLatitude(hillDetails.getLatitude());
        hill.setLongitude(hillDetails.getLongitude());

        return hillRepository.save(hill);
    }

    public void deleteHill(Integer id) {
        Hill hill = hillRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hill not found"));

        boolean hasEvents = !eventRepository.findByHillId(hill.getId()).isEmpty();
        if (hasEvents) {
            throw new BadRequestException("Cannot delete hill because it has associated events");
        }

        hillRepository.delete(hill);
    }
}
