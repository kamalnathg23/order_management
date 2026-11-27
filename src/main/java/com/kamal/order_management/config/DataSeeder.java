package com.kamal.order_management.config;

import com.kamal.order_management.domain.*;
import com.kamal.order_management.repository.CouponRepository;
import com.kamal.order_management.repository.ProductRepository;
import com.kamal.order_management.repository.UserRepository;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    // name, description, category, price, mrp, stock, image (served by the Next.js frontend from /public)
    private static final String[][] CATALOGUE = {
        {"Laptop", "14-inch ultrabook, 16GB RAM, 512GB SSD", "Laptops", "59999.00", "74999.00", "25", "/products/laptop.svg"},
        {"Gaming Laptop", "15.6-inch 165Hz, RTX graphics, 1TB SSD", "Laptops", "94999.00", "119999.00", "8", "/products/gaming-laptop.svg"},
        {"Wireless Mouse", "Ergonomic, 2.4GHz, silent clicks", "Accessories", "799.00", "1499.00", "200", "/products/mouse.svg"},
        {"Mechanical Keyboard", "Hot-swappable switches, RGB backlight", "Accessories", "3499.00", "5999.00", "80", "/products/keyboard.svg"},
        {"USB-C Hub", "7-in-1 with HDMI 4K, PD 100W", "Accessories", "1899.00", "3299.00", "120", "/products/usb-hub.svg"},
        {"27\" Monitor", "QHD IPS 144Hz, HDR10", "Monitors", "18999.00", "26999.00", "40", "/products/monitor-27.svg"},
        {"24\" Monitor", "Full HD IPS 75Hz, ultra-thin bezels", "Monitors", "8999.00", "12999.00", "6", "/products/monitor-24.svg"},
        {"Wireless Headphones", "Active noise cancelling, 40h battery", "Audio", "4999.00", "9999.00", "60", "/products/headphones.svg"},
        {"Bluetooth Speaker", "Waterproof IPX7, deep bass", "Audio", "2499.00", "3999.00", "0", "/products/speaker.svg"},
        {"Smartphone", "6.5-inch AMOLED, 128GB, 50MP camera", "Mobiles", "17999.00", "21999.00", "35", "/products/smartphone.svg"},
        {"Smartwatch", "AMOLED display, SpO2, 10-day battery", "Wearables", "2999.00", "6999.00", "90", "/products/smartwatch.svg"},
        {"Power Bank", "20000mAh, 22.5W fast charging", "Mobiles", "1299.00", "2199.00", "150", "/products/power-bank.svg"},
    };

    @Bean
    CommandLineRunner seed(UserRepository users, ProductRepository products, CouponRepository coupons,
                           PasswordEncoder encoder,
                           @Value("${app.admin.email}") String adminEmail,
                           @Value("${app.admin.password}") String adminPassword) {
        return args -> {
            if (!users.existsByEmail(adminEmail)) {
                users.save(new User("Admin", adminEmail, encoder.encode(adminPassword), Role.ADMIN));
            }
            seedCatalogue(products);
            if (coupons.count() == 0) {
                Coupon c = new Coupon();
                c.setCode("WELCOME10");
                c.setType(DiscountType.PERCENTAGE);
                c.setValue(new BigDecimal("10"));
                c.setMaxDiscount(new BigDecimal("2000"));
                coupons.save(c);
                Coupon f = new Coupon();
                f.setCode("FLAT500");
                f.setType(DiscountType.FIXED);
                f.setValue(new BigDecimal("500"));
                f.setMinOrderAmount(new BigDecimal("3000"));
                coupons.save(f);
            }
        };
    }

    /** Creates missing catalogue products; only fills empty fields on existing ones (never overwrites admin edits). */
    private static void seedCatalogue(ProductRepository products) {
        for (String[] r : CATALOGUE) {
            ProductEntity p = products.findByName(r[0]).orElse(null);
            boolean changed = false;
            if (p == null) {
                p = new ProductEntity();
                p.setName(r[0]);
                p.setDescription(r[1]);
                p.setPrice(new BigDecimal(r[3]));
                p.setStock(Integer.parseInt(r[5]));
                changed = true;
            }
            if (p.getCategory() == null) { p.setCategory(r[2]); changed = true; }
            BigDecimal mrp = new BigDecimal(r[4]);
            if (p.getMrp() == null && mrp.compareTo(p.getPrice()) > 0) { p.setMrp(mrp); changed = true; }
            if (p.getImageUrl() == null || p.getImageUrl().isBlank()) { p.setImageUrl(r[6]); changed = true; }
            if (changed) products.save(p);
        }
    }
}
