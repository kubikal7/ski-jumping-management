package com.example.ski_jumping_management.controller;

import com.example.ski_jumping_management.model.TestModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Test {

    @GetMapping("/test/{id}")
    public TestModel test(@PathVariable int id){
        TestModel model=new TestModel(id);
        return model;
    }
}
