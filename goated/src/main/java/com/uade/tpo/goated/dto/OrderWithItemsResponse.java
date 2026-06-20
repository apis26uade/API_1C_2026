package com.uade.tpo.goated.dto;

import java.util.List;

import com.uade.tpo.goated.entity.Order;
import com.uade.tpo.goated.entity.OrderItem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderWithItemsResponse {

    private Order order;
    private List<OrderItem> items;
}
