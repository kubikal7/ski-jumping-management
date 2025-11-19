package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.model.Hill;
import com.example.ski_jumping_management.service.HillService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/hills")
@RequiredArgsConstructor
public class HillController {

    private final HillService hillService;

    @GetMapping
    public Page<Hill> getHills(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Short minHillSize,
            @RequestParam(required = false) Short maxHillSize,
            @RequestParam(required = false) Short minKPoint,
            @RequestParam(required = false) Short maxKPoint,
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        return hillService.getHills(
                name, city, country,
                minHillSize, maxHillSize,
                minKPoint, maxKPoint,
                latitude, longitude,
                page, size, sortBy, sortDirection
        );
    }

    @GetMapping("/{id}")
    public Hill getHill(@PathVariable Integer id) {
        return hillService.getHill(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATE')")
    public Hill createHill(@RequestBody Hill hill) {
        return hillService.createHill(hill);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATE')")
    public Hill updateHill(@PathVariable Integer id, @RequestBody Hill hill) {
        return hillService.updateHill(id, hill);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OPERATE')")
    public void deleteHill(@PathVariable Integer id) {
        hillService.deleteHill(id);
    }
}
