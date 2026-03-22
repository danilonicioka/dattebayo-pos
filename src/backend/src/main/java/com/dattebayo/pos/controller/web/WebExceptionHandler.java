package com.dattebayo.pos.controller.web;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

@ControllerAdvice(annotations = org.springframework.stereotype.Controller.class)
public class WebExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(Exception ex) {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("error");
        modelAndView.addObject("message", ex.getMessage());
        
        // Log the exception (stdout for Docker logs)
        System.err.println("Web Error: " + ex.getMessage());
        ex.printStackTrace();
        
        return modelAndView;
    }
}
