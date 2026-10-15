package com.kamal.order_management.service;

import com.kamal.order_management.model.Customer;
import com.kamal.order_management.model.Order;
import com.kamal.order_management.model.Product;
import java.util.*;

public class InMemoryOrderService {

    private final Map<Long, Product> products = new HashMap<>();
    private final Map<Long, Customer> customers = new HashMap<>();
    private final Map<Long, Order> orders = new LinkedHashMap<>();   // keeps insertion order
    private long orderSeq = 1;

    public void addProduct(Product p)   { products.put(p.getId(), p); }
    public void addCustomer(Customer c) { customers.put(c.getId(), c); }

     // cart: productId -> quantity
    public Order placeOrder(Long customerId, Map<Long, Integer> cart) {
        Customer customer = customers.get(customerId);
        if (customer == null) {
            throw new IllegalArgumentException("Customer not found: " + customerId);
        }

        Order order =new Order(orderSeq++,customer);

        
        // 1st pass: validate everything
        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Product p = products.get(entry.getKey());
            if (p == null) {
                throw new IllegalArgumentException("Product not found: " + entry.getKey());
            }
            if (p.getStock() < entry.getValue()) {
                throw new IllegalStateException("Insufficient stock for " + p.getName());
            }
            order.addItem(p, entry.getValue());
        }

        // 2nd pass: deduct stock only after everything validated
        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Product p = products.get(entry.getKey());
            p.setStock(p.getStock() - entry.getValue());
        }

        orders.put(order.getId(), order);
        return order;
    }

    public List<Product> getProductsSortedByPrice() {
        List<Product> list = new ArrayList<>(products.values());
        list.sort(Comparator.comparing(Product::getPrice));
        return list;
    }


    public List<Product> getProductsSortedByPriceThenName() {
        List<Product> list = new ArrayList<>(products.values());
        list.sort(Comparator.comparing(Product::getPrice).thenComparing(Product::getName)); //comparing by price and by name
        return list;
    }

     public List<Order> getOrdersByCustomer(Long customerId) {
        List<Order> result = new ArrayList<>();
        for (Order o : orders.values()) {
            if (o.getCustomer().getId().equals(customerId)) {
                result.add(o);
            }
        }
        return result;
    }
    

}