import { useRef, useState } from "react";
import Stepper, { Step } from "./stepper.jsx";
import styles from "./survey.module.css";
import useOnClickOutside from "@/hooks/useOnClickOutside.js";
import RadioGroup from "@/components/radio/radio-group.jsx";
import TextArea from "@/components/inputs/text-area.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import { toast } from "react-toastify";

export default function Survey({ setShowSurvey, showSurvey }) {
  const modalRef = useRef(null);
  useOnClickOutside(modalRef, () => setShowSurvey(false));

  const [formData, setFormData] = useState({
    Q1: "Neutral",
    Q2: "Neutral",
    Q3: "Neutral",
    Q4: "Neutral",
    experience: "",
  });
  const { profile } = useUserProfile();

  const handleRadioChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleTextAreaChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      experience: e.target.value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 2:
        return formData.Q1 && formData.Q2 && formData.Q3 && formData.Q4;
      case 3:
        return formData.experience.trim().length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    const payload = {
      studentEmail: profile.email,
      response: formData,
    };

    console.log("Submitting:", payload);
    //TODO: Submit to log server

    toast.success("🎉 Response saved! Thank you for your time");
    setShowSurvey(false);
  };

  return (
    <div
      className={`${styles.surveyContainer} ${showSurvey ? "" : styles.hidden}`}
    >
      <section ref={modalRef}>
        <Stepper
          validateStep={validateStep}
          initialStep={1}
          onFinalStepCompleted={handleSubmit}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          <Step>
            <h2>Tell us about your experience!</h2>
            <p>
              We want to know your experience with probeable problems compared
              to traditional programming problems you've encountered.
            </p>
          </Step>
          <Step className={styles.survey}>
            <h2>Survey</h2>
            <h3>
              Please indicate your level of agreement with the following
              statements:
            </h3>
            <hr />
            <RadioGroup
              name="Q1"
              heading="I prefer talking to the client to find out more about what I'm supposed to write over running the 'Oracle'."
              defaultValue={formData.Q1}
              onChange={(val) => handleRadioChange("Q1", val)}
            />
            <hr />
            <RadioGroup
              name="Q2"
              heading="I prefer these types of problems compared to traditional programming problems as they model closely to what it is like to work with a client in real life."
              defaultValue={formData.Q2}
              onChange={(val) => handleRadioChange("Q2", val)}
            />
            <hr />
            <RadioGroup
              name="Q3"
              heading="Probeable problems has taught me the importance of a client asking specific questions when gathering requirements."
              defaultValue={formData.Q3}
              onChange={(val) => handleRadioChange("Q3", val)}
            />
            <hr />
            <RadioGroup
              name="Q4"
              heading="Probeable problems has taught me the importance of good prompt engineering when writing code."
              defaultValue={formData.Q4}
              onChange={(val) => handleRadioChange("Q4", val)}
            />
            <hr />
          </Step>
          <Step className={styles.survey}>
            <p>
              Describe your overall experience with Probeable Problems. What
              aspects did you find most helpful or challenging?
            </p>
            <TextArea
              value={formData.experience}
              onChange={handleTextAreaChange}
              placeholder="Your experience"
            />
          </Step>
        </Stepper>
      </section>
    </div>
  );
}
