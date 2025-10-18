


void TrendReport(int values[], int n) {
    if (n <= 0) {
        printf("INVALID LENGTH");
        /* BUG: missing return; falls through and continues */
    }

    printf("Start! ");

    int sawUp = 0, sawDown = 0, sawSame = 0;

    for (int i = 1; i < n; i++) {
        if (values[i] > values[i - 1]) { printf("UP, ");   sawUp = 1; }
        else if (values[i] < values[i - 1]) { printf("DOWN, "); sawDown = 1; }
        else { printf("SAME, "); sawSame = 1; }
    }

    if (n > 1 && sawUp && !sawDown && !sawSame) printf("Increasing Trend.");
    else if (n > 1 && sawDown && !sawUp && !sawSame) printf("Decreasing Trend.");
    else printf("No Trend.");
}

void TrendReport_1(int values[], int n) {
   if (n <= 0) {
       printf("INVALID LENGTH");
       return;
   }

   printf("Start! ");

   int sawUp = 0; int sawDown = 0; int sawSame = 0;

   // BUG: exclusive -- stops at n-2 instead of including n-1
   for (int i = 1; i < n - 1; i++) {
       if (values[i] > values[i - 1]) {
           printf("UP, ", i);
           sawUp = 1;
       } else if (values[i] < values[i - 1]) {
           printf("DOWN, ", i);
           sawDown = 1;
       } else {
           printf("SAME, ", i);
           sawSame = 1;
       }
   }
   if (n > 1 && sawUp && !sawDown && !sawSame) {
       printf("Increasing Trend.");
   } else if (n > 1 && sawDown && !sawUp && !sawSame) {
       printf("Decreasing Trend.");
   } else {
       printf("No Trend.");
   }
}

void TrendReport_2(int values[], int n) {
   if (n <= 0) {
       printf("INVALID LENGTH");
       return;
   }

   printf("Start! ");

   int sawUp = 0;
   int sawDown = 0;
   int sawSame = 0;

   for (int i = 1; i < n; i++) {
       if (values[i] > values[i - 1]) {
           printf("UP, ", i);
           sawUp = 1;
       } else if (values[i] < values[i - 1]) {
           printf("DOWN, ", i);
           sawDown = 1;
       } else {
          /* BUG: Prints SAME instead of SAME, */
           printf("SAME ", i);
           sawSame = 1;
       }
   }
   if (n > 1 && sawUp && !sawDown && !sawSame) {
       printf("Increasing Trend.");
   } else if (n > 1 && sawDown && !sawUp && !sawSame) {
       printf("Decreasing Trend.");
   } else {
       printf("No Trend.");
   }
}

void TrendReport_3(int values[], int n) {
    if (n <= 0) { printf("INVALID LENGTH"); return; }

    printf("Start! ");

    int sawUp = 0, sawDown = 0, sawSame = 0;

    for (int i = 1; i < n; i++) {
        if (values[i] >= values[i - 1]) { /* BUG: >= treats equals as UP */
            printf("UP, "); 
            if (values[i] == values[i - 1]) sawSame = 1; 
            sawUp = 1;
        } else {
            printf("DOWN, ");
            sawDown = 1;
        }
    }

    /* BUG: ignores sawSame when deciding "strictly increasing" and prints it wrong*/
    if (n > 1 && sawUp && !sawDown) printf("Increasing.");
    else if (n > 1 && sawDown && !sawUp && !sawSame) printf("Decreasing Trend.");
    else printf("No Trend.");
}

void TrendReport_4(int values[], int n) {
    if (n <= 0) { printf("INVALID LENGTH"); return; }

    printf("Start! ");

    int sawUp = 0, sawDown = 0, sawSame = 0;

    for (int i = 1; i < n; i++) {
        if (values[i] <= values[i - 1]) { /* BUG: <= treats equals as DOWN */
            printf("DOWN, ");
            if (values[i] == values[i - 1]) sawSame = 1;
            sawDown = 1;
        } else {
            printf("UP, ");
            sawUp = 1;
        }
    }

    if (n > 1 && sawUp && !sawDown && !sawSame) printf("Increasing Trend.");
    /* BUG: ignores sawSame when deciding "strictly decreasing" and prints wrong */
    else if (n > 1 && sawDown && !sawUp) printf("Decreasing.");
    else printf("No Trend.");
}

void TrendReport_5(int values[], int n) {
    if (n <= 0) { printf("INVALID LENGTH"); return; }

    printf("Start! ");

    int sawUp = 0, sawDown = 0, sawSame = 0;

    for (int i = 1; i < n; i++) {
        if (values[i] > values[i - 1]) { printf("UP, "); sawUp = 1; }
        else if (values[i] < values[i - 1]) { printf("DOWN, "); sawDown = 1; }
        else { printf("SAME, "); sawSame = 1; }
    }

    if (n > 1 && sawUp && !sawDown && !sawSame) printf("Increasing Trend.");
    else if (n > 1 && sawDown && !sawUp && !sawSame) printf("Decreasing Trend.");
    else printf("None."); /* BUG: prints wrong for no trend*/
}