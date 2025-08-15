package akl.p4p.uoa.data;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Activity {
    private String component;
    private String action; 
    private String name; 
    private String content; 
    private String input; 
    private String output; 

    private Instant timestamp = Instant.now();
}
