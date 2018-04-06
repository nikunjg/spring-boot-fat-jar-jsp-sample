package com.test.app.controller;

import com.test.app.dto.BaseDTO;
import com.test.app.service.IBaseService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Collection;

public abstract class BaseController<T extends BaseDTO> {
    public abstract IBaseService<T, ?> getService();

    @RequestMapping(value = "/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public Collection<T> getAll() {
        return this.getService().getAll();
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET, consumes = MediaType.APPLICATION_JSON_VALUE)
    public T get(@PathVariable Long id) {
        return this.getService().get(id);
    }


    @RequestMapping(value = "/delete", method = RequestMethod.DELETE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public boolean delete(@RequestBody T dto) {
        return this.getService().delete(dto);
    }

    @RequestMapping(value = "/add", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public T save(@RequestBody T dto) {
        return this.getService().save(dto);
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public T update(@RequestBody T dto) {
        return this.getService().update(dto);
    }
}