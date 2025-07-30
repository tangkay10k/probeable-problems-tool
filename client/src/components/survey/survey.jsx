import Stepper, { Step } from "./stepper.jsx";
import styles from "./survey.module.css";
import Input from "@/components/inputs/text-input.jsx";
import { useEffect, useRef } from "react";

export default function Survey({ setShowSurvey, showSurvey }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSurvey(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowSurvey]);

  return (
    <div
      className={`${styles.surveyContainer} ${showSurvey ? "" : styles.hidden}`}
    >
      <section ref={modalRef}>
        <Stepper
          initialStep={1}
          onStepChange={(step) => {
            console.log(step);
          }}
          onFinalStepCompleted={() => console.log("All steps completed!")}
          backButtonText="Previous"
          nextButtonText="Next"
        >
          <Step>
            <h2>Tell us about your experience!</h2>
            <p>
              Lorem Ipsum Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Cras consectetur porttitor venenatis. Ut pretium ut massa ut
              rutrum. Vestibulum pulvinar nulla id enim ultricies vulputate. Sed
              tempor ex id massa auctor fringilla. Quisque ante sapien, lobortis
              sit amet diam vitae, placerat euismod sapien. Duis euismod, velit
              et ullamcorper eleifend, nulla lectus placerat urna, eget
            </p>
          </Step>
          <Step>
            <h2>Step 2</h2>
            <img
              style={{
                height: "100px",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center -70px",
                borderRadius: "15px",
                marginTop: "1em",
              }}
              src="https://www.purrfectcatgifts.co.uk/cdn/shop/collections/Funny_Cat_Cards_640x640.png?v=1663150894"
            />
            <p>Custom step content!</p>
          </Step>
          <Step>
            <h2>How about an input?</h2>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name?"
            />
          </Step>
          <Step>
            <h2>Final Step</h2>
            <p>You made it!</p>
          </Step>
        </Stepper>
      </section>
    </div>
  );
}
