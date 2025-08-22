int largestInRange(int list[], int n, int a, int b) {
    if (n <= 0) return -1;
    if (a < 0 || b < 0 || a >= n || b >= n) return -1;
    if (a > b) { int t = a; a = b; b = t; }
    if (b - a <= 1) return -1;

    int maxIndex = a + 1;
    for (int i = maxIndex + 1; i < b; i++) {
        if (arr[i] > list[maxIndex]) {
            maxIndex = i;
        }
    }
    return maxIndex;
}