package com.kamal.ordermanagement.playground;

import com.kamal.order_management.model.Customer;
import com.kamal.order_management.model.Order;
import com.kamal.order_management.model.Product;
import com.kamal.order_management.service.InMemoryOrderService;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;


public class Phase1Demo {
    public static void main(String[] args) {
        InMemoryOrderService service = new InMemoryOrderService();

        service.addProduct(new Product(1L, "Keyboard", new BigDecimal("1499.00"), 10));
        service.addProduct(new Product(2L, "Mouse",    new BigDecimal("599.00"),  25));
        service.addProduct(new Product(3L, "Monitor",  new BigDecimal("8999.00"), 5));
        service.addCustomer(new Customer(1L, "Kamal", "kamal@mail.com"));

        Map<Long, Integer> cart = new HashMap<>();
        cart.put(1L, 2);
        cart.put(2L, 1);

        Order order = service.placeOrder(1L, cart);
        System.out.println("Order " + order.getId() + " total = " + order.getTotal());
        System.out.println("Keyboard stock left = " + service.getProductsSortedByPrice().get(1).getStock());

        service.getProductsSortedByPrice().forEach(System.out::println);
        System.out.println(service.getOrdersByCustomer(1L).size() + " order(s) for customer 1");
        
    }
}