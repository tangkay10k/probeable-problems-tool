package akl.p4p.uoa.data;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProblemType {
	FUNCTION("Single Function"),
	OOP("OOP");

	private final String jsonValue;
	ProblemType(String jsonValue) { this.jsonValue = jsonValue; }

	@JsonValue
	public String toJson() {
		return this.jsonValue;
	}

	@JsonCreator
	public static ProblemType fromJson(String value) {
		for (ProblemType pt : values()) {
			if (pt.jsonValue.equalsIgnoreCase(value)) {
				return pt;
			}
		}
		throw new IllegalArgumentException("Unknown ProblemType: " + value);
	}
}
