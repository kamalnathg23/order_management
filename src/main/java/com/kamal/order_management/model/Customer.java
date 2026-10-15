package com.kamal.order_management.model;


import java.util.Objects;

public class Customer{

    private final Long id;
    private String name;
    private String email;

    public Customer(Long id,String name,String email){
        this.id=id;
        this.name=name;
        this.email=email;
    }

    public Long getId() 
    { 
        return id; 
    }
     public String getName() { return name; }
    
     public String getEmail() { return email; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Customer other)) return false;   // Java 17 pattern matching
        return Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Customer{id=" + id + ", name=" + name +", email=" + email + "}";
    }

}


