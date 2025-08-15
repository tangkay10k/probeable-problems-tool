package akl.p4p.uoa.data;

import java.time.Instant;

import akl.p4p.uoa.enums.Action;
import akl.p4p.uoa.enums.Component;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Activity {
    private Component component;
    private Action action; 
    private String name; 
    private String content; 
    private String input; 
    private String output; 

    private Instant timestamp = Instant.now();
}
