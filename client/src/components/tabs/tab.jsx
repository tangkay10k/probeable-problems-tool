import styles from "./tab.module.css";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

export default function DualTabs({
  firstPanelHeading = "Panel 1",
  firstPanel = null,
  secondPanelHeading = "Panel 2",
  secondPanel = null,
}) {
  return (
    <Tabs className={styles.tabWrapper}>
      <TabList className={styles.tabsList}>
        <Tab
          className={styles.tab}
          selectedClassName={styles.tabSelected}
          disabledClassName={styles.tabDisabled}
        >
          {firstPanelHeading}
        </Tab>
        <Tab
          className={styles.tab}
          selectedClassName={styles.tabSelected}
          disabledClassName={styles.tabDisabled}
        >
          {secondPanelHeading}
        </Tab>
      </TabList>

      <TabPanel
        className={styles.tabPanel}
        selectedClassName={styles.tabPanelSelected}
      >
        {firstPanel}
      </TabPanel>
      <TabPanel
        className={styles.tabPanel}
        selectedClassName={styles.tabPanelSelected}
      >
        {secondPanel}
      </TabPanel>
    </Tabs>
  );
}