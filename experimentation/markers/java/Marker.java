import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * This class is to be used to run an input class against lecturer predefined
 * unit tests. It will also be used to
 * validate a student's submission against the model answer (expected.txt).
 * <p>
 * Since we are restricted to java standard SDK, test suites need to be written
 * in a particular format:
 * <p>
 * int testFoo() {
 * // Insert method under test here,
 * // Optionally, return a value.
 * }
 * <p>
 * This marker class will then invoke all test cases in the test suite class,
 * and redirect stdout and capture the
 * return values of each test case to be written to a txt file. If it is a
 * student's submission, it will be validated
 * against (expected.txt) which will have been set up beforehand.
 * <p>
 */
public class Marker {
    public static void main(String[] args) {

        // TO DO: allow test suites to be injected rather than hard coded.
        FooTest obj = new FooTest();

        Class<?> clazz = obj.getClass();
        Method[] methods = clazz.getDeclaredMethods();

        // Run all test cases defined in the test file.
        int testNumber = 0;
        for (Method method : methods) {
            method.setAccessible(true);
            try {
                captureStdoutAndReturnValues(testNumber++, obj, method);
            } catch (IllegalAccessException | InvocationTargetException e) {
                System.err.println("Error invoking method " + method.getName() + ": " + e.getMessage());
            } catch (FileNotFoundException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private static void captureStdoutAndReturnValues(int testNumber, Object testSuite, Method testcase)
            throws InvocationTargetException, IllegalAccessException, FileNotFoundException {
        // Save the original System.out
        PrintStream originalOut = System.out;

        // TO DO: Allow new file to be created either as expected (student attempt) or
        // output-problem-#no. (lecturer)
        File file = new File("output.txt");
        FileOutputStream fos = new FileOutputStream(file, true);
        PrintStream ps = new PrintStream(fos);
        System.setOut(ps);

        // All methods in the test suite do NOT have any parameters
        System.out.print("Test number: " + testNumber + "\nStdout: ");
        Object res = testcase.invoke(testSuite);
        System.out.println("Result: " + res);

        // Restore System.out after writing to file.
        System.setOut(originalOut);
    }
}