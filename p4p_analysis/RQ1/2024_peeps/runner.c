// runner.c — standalone C replacement for run.py
// Build: cc -O2 -std=c11 runner.c -o runner
// Run:   ./runner [CSV_IN] [SUMMARY_JSON] [SUMMARY_CSV]

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

/* ---------- Config (defaults) ---------- */
static const char *DEFAULT_CSV_IN      = "lab08-523871-Probeable-FindSmallestEven.csv";
static const char *DEFAULT_JSON_OUT    = "constraint_mismatch_summary.json";
static const char *DEFAULT_SUMMARY_CSV = "constraint_mismatch_summary.csv";

/* ---------- Simple dynamic string buffer ---------- */
typedef struct {
    char *data;
    size_t len, cap;
} StrBuf;

static void sb_init(StrBuf *b){ b->data=NULL; b->len=0; b->cap=0; }

static void sb_reserve(StrBuf *b, size_t need){
    if(need <= b->cap) return;
    size_t ncap = b->cap ? b->cap*2 : 256;
    while(ncap < need) ncap *= 2;
    char *nd = (char*)realloc(b->data, ncap);
    if(!nd){ fprintf(stderr,"OOM\n"); exit(1); }
    b->data = nd; b->cap = ncap;
}

static void sb_append_char(StrBuf *b, char c){
    sb_reserve(b, b->len+2);
    b->data[b->len++] = c;
    b->data[b->len] = 0;
}

static void sb_append_str(StrBuf *b, const char *s){
    size_t n = strlen(s);
    sb_reserve(b, b->len+n+1);
    memcpy(b->data + b->len, s, n);
    b->len += n;
    b->data[b->len] = 0;
}

/* printf-like append */
#include <stdarg.h>
static void sb_printf(StrBuf *b, const char *fmt, ...){
    va_list ap; va_start(ap, fmt);
    char tmp[1024];
    int n = vsnprintf(tmp, sizeof(tmp), fmt, ap);
    va_end(ap);
    if(n < 0) return;
    if((size_t)n < sizeof(tmp)){
        sb_append_str(b, tmp);
        return;
    }
    // large
    char *buf = (char*)malloc((size_t)n+1);
    if(!buf){ fprintf(stderr,"OOM\n"); exit(1); }
    va_start(ap, fmt);
    vsnprintf(buf, (size_t)n+1, fmt, ap);
    va_end(ap);
    sb_append_str(b, buf);
    free(buf);
}

/* ---------- Helpers: normalize whitespace; split on token ---------- */
static void normalize_output_inplace(char *s){
    // trim + collapse all whitespace to single spaces
    size_t i=0, j=0;
    // skip leading ws
    while(s[i] && isspace((unsigned char)s[i])) i++;
    int in_space = 0;
    for(; s[i]; ++i){
        if(isspace((unsigned char)s[i])){
            if(!in_space){ s[j++] = ' '; in_space = 1; }
        }else{
            s[j++] = s[i];
            in_space = 0;
        }
    }
    // trim trailing space
    if(j>0 && s[j-1]==' ') j--;
    s[j]=0;
}

typedef struct { char **items; int count; } StringList;

static void sl_init(StringList *sl){ sl->items=NULL; sl->count=0; }
static void sl_push(StringList *sl, char *owned){
    sl->items = (char**)realloc(sl->items, sizeof(char*)*(sl->count+1));
    if(!sl->items){ fprintf(stderr,"OOM\n"); exit(1); }
    sl->items[sl->count++] = owned;
}

static StringList split_on_token_and_normalize(const char *s, const char *tok){
    StringList out; sl_init(&out);
    size_t toklen = strlen(tok);
    const char *p = s, *q;
    while(1){
        q = strstr(p, tok);
        size_t len = q ? (size_t)(q - p) : strlen(p);
        char *seg = (char*)malloc(len+1);
        memcpy(seg, p, len); seg[len]=0;
        normalize_output_inplace(seg);
        if(seg[0]!=0) sl_push(&out, seg);
        else free(seg);
        if(!q) break;
        p = q + toklen;
    }
    return out;
}

/* ---------- Reference & buggy implementations (emit into StrBuf) ---------- */

#define EMIT(...) sb_printf(out, __VA_ARGS__)

static void SmallestEven_ref(int values[], int length, StrBuf *out){
    int i, pos=-1;
    for(i=0;i<length;i++) if(values[i]%2==0) pos=i;
    if(pos>=0){
        int min = values[pos];
        for(i=0;i<length;i++)
            if((values[i]<min) && (values[i]%2==0)) min=values[i];
        for(i=length-1;i>=0;i--)
            if(values[i]==min) EMIT("%d ", i);
    }else{
        EMIT("No evens");
    }
}

static void SmallestEven_1(int values[], int length, StrBuf *out){
    int i, pos=-1;
    if(length<=0){ EMIT("No evens"); return; } // obey #5
    for(i=0;i<length;i++) if(values[i]%2==0) pos=i;
    if(pos<0){ EMIT("No even"); return; } // bug: message differs
    int min = values[pos];
    for(i=0;i<length;i++) if(values[i]%2==0 && values[i]<min) min=values[i];
    for(i=length-1;i>=0;i--) if(values[i]==min) EMIT("%d ", i);
}

static void SmallestEven_2(int values[], int length, StrBuf *out){
    int i, pos=-1;
    if(length<=0){ EMIT("No evens"); return; }
    for(i=0;i<length;i++) if(values[i]%2==0) pos=i;
    if(pos<0){ EMIT("No evens"); return; }
    // BUG: choose max even
    int target = values[pos];
    for(i=0;i<length;i++) if(values[i]%2==0 && values[i]>target) target=values[i];
    for(i=length-1;i>=0;i--) if(values[i]==target) EMIT("%d ", i);
}

static void SmallestEven_3(int values[], int length, StrBuf *out){
    int i, pos=-1;
    if(length<=0){ EMIT("No evens"); return; }
    for(i=0;i<length;i++) if(values[i]%2==0) pos=i;
    if(pos<0){ EMIT("No evens"); return; }
    int min = values[pos];
    for(i=0;i<length;i++) if(values[i]%2==0 && values[i]<min) min=values[i];
    // BUG: only first from right
    for(i=length-1;i>=0;i--){
        if(values[i]==min){ EMIT("%d ", i); break; }
    }
}

static void SmallestEven_4(int values[], int length, StrBuf *out){
    int i, pos=-1;
    if(length<=0){ EMIT("No even"); return; } // BUG: prints nothing
    for(i=0;i<length;i++) if(values[i]%2==0) pos=i;
    if(pos<0){ EMIT("No evens"); return; }
    int min = values[pos];
    for(i=0;i<length;i++) if(values[i]%2==0 && values[i]<min) min=values[i];
    for(i=length-1;i>=0;i--) if(values[i]==min) EMIT("%d ", i);
}

static void SmallestEven_5(int values[], int length, StrBuf *out){
    int i, pos=-1;
    if(length<=0){ EMIT("No evens"); return; }
    for(i=0;i<length;i++) if(values[i]%2==0) pos=i;
    if(pos<0){ EMIT("No evens"); return; }
    int min = values[pos];
    for(i=0;i<length;i++) if(values[i]%2==0 && values[i]<min) min=values[i];
    for(i=length-1;i>=0;i--){
        if(values[i]==min){
            EMIT("%d ", min); // BUG: prints value instead of index
        }
    }
}

/* ---------- Parse 'answer' cell into values[] & n ---------- */

static bool parse_numbers_from_braces(const char *s, int **out_vals, int *out_n){
    const char *lb = strchr(s, '{');
    const char *rb = lb ? strchr(lb, '}') : NULL;
    if(!lb || !rb || rb<=lb) return false;

    // copy inside {...} and parse the values
    size_t len = (size_t)(rb - lb - 1);
    char *tmp = (char*)malloc(len+1);
    memcpy(tmp, lb+1, len); tmp[len]=0;

    int cap=16, n_vals=0; 
    int *vals = (int*)malloc(sizeof(int)*cap);
    char *p = tmp;
    while(*p){
        while(isspace((unsigned char)*p)) p++;
        char *endp = NULL;
        long v = strtol(p, &endp, 10);
        if(p==endp){
            if(*p==','){ p++; continue; }
            break;
        }
        if(n_vals==cap){ cap*=2; vals = (int*)realloc(vals, sizeof(int)*cap); }
        vals[n_vals++] = (int)v;
        p = endp;
        while(*p && *p!=',') p++;
        if(*p==',') p++;
    }
    free(tmp);
    if(n_vals==0){ free(vals); return false; }

    // try to parse: int n = <number>;
    // search from rb onward
    int use_n = n_vals; // fallback: use count of values
    const char *q = strstr(rb, "int n");
    if(q){
        const char *eq = strchr(q, '=');
        if(eq){
            char *endn=NULL;
            long n_decl = strtol(eq+1, &endn, 10);
            if(eq+1 != endn){ // got a number
                if(n_decl < 0){
                    use_n = (int)n_decl;           // allow negative to trigger buggy_4 behaviour
                }else{
                    // clamp to available values to avoid OOB
                    use_n = (int)n_decl <= n_vals ? (int)n_decl : n_vals;
                }
            }
        }
    }

    *out_vals = vals;
    *out_n    = use_n;
    return true;
}


static bool parse_numbers_from_csv_list(const char *s, int **out_vals, int *out_n){
    // e.g. "50, -2, 2, 30, 45"
    // We'll scan for signed ints
    int cap=16, n=0; int *vals = (int*)malloc(sizeof(int)*cap);
    const char *p = s;
    bool got_any=false;
    while(*p){
        while(isspace((unsigned char)*p)) p++;
        char *endp=NULL;
        long v = strtol(p, &endp, 10);
        if(p==endp){
            // skip until next digit or sign
            if(*p==0) break;
            p++;
            continue;
        }
        if(n==cap){ cap*=2; vals = (int*)realloc(vals, sizeof(int)*cap); }
        vals[n++] = (int)v;
        got_any=true;
        p = endp;
    }
    if(!got_any){ free(vals); return false; }
    *out_vals = vals; *out_n = n;
    return true;
}

static bool parse_answer_cell(const char *answer, int **out_vals, int *out_n){
    if(!answer) return false;
    if(strstr(answer, "int values") && strstr(answer, "int n")){
        // Try to read from {...}
        return parse_numbers_from_braces(answer, out_vals, out_n);
    }
    // else treat entire cell as a comma list
    return parse_numbers_from_csv_list(answer, out_vals, out_n);
}

/* ---------- Tiny CSV reader for 2 columns: "answer","ANON_USER" ---------- */

typedef struct {
    char *answer;
    char *anon_user;
} CsvRow;

static int read_row(FILE *fp, CsvRow *row){
    row->answer=NULL; row->anon_user=NULL;
    int c = fgetc(fp);
    if(c==EOF) return 0;

    // unread
    ungetc(c, fp);

    // parse first field (answer)
    StrBuf f1; sb_init(&f1);
    StrBuf f2; sb_init(&f2);

    // helper to read one field (handles quoted, including newlines)
    auto int read_field(FILE*, StrBuf*, int*); // GNU C nested prototype for clarity
    int read_field(FILE *f, StrBuf *dst, int *term){ // term: the char that terminated (, or \n or EOF)
        *term = 0;
        int ch = fgetc(f);
        if(ch==EOF){ *term=EOF; return 1; }
        if(ch=='"'){
            // quoted field
            while(1){
                int d = fgetc(f);
                if(d==EOF){ *term=EOF; break; }
                if(d=='"'){
                    int next = fgetc(f);
                    if(next=='"'){ sb_append_char(dst, '"'); } // escaped quote
                    else{ // end of field
                        if(next==',' || next=='\n' || next=='\r' || next==EOF){
                            *term = next;
                            if(next=='\r'){ // swallow possible \n
                                int nn = fgetc(f);
                                if(nn!='\n') ungetc(nn,f);
                                *term = '\n';
                            }
                            break;
                        }else{
                            // RFC allows only comma/newline; put back
                            ungetc(next, f);
                            *term = 0; // treat as end
                            break;
                        }
                    }
                }else{
                    sb_append_char(dst, (char)d);
                }
            }
        }else{
            // unquoted: first char is ch
            while(ch!=EOF && ch!=',' && ch!='\n' && ch!='\r'){
                sb_append_char(dst, (char)ch);
                ch = fgetc(f);
            }
            if(ch=='\r'){ int nn=fgetc(f); if(nn!='\n') ungetc(nn,f); *term='\n'; }
            else *term = ch;
        }
        return 1;
    }

    int term=0;
    if(!read_field(fp, &f1, &term)) return 0;
    if(term==EOF) return 0;

    // If term was comma, read second; if newline, empty second field
    if(term==','){
        int term2=0;
        read_field(fp, &f2, &term2);
        // consume trailing newline if any
        if(term2!=EOF && term2!='\n'){
            int ch;
            while((ch=fgetc(fp))!=EOF && ch!='\n');
        }
    }else{
        // no second field; consume rest of line already done
    }

    row->answer    = f1.data ? f1.data : strdup("");
    row->anon_user = f2.data ? f2.data : strdup("");
    return 1;
}

/* ---------- Mismatch counting per user ---------- */
typedef struct {
    char *user;
    int counts[6]; // 1..5 used
} UserCount;

static UserCount* users = NULL;
static int users_n = 0;

static int find_or_add_user(const char *u){
    for(int i=0;i<users_n;i++){
        if(strcmp(users[i].user,u)==0) return i;
    }
    users = (UserCount*)realloc(users, sizeof(UserCount)*(users_n+1));
    users[users_n].user = strdup(u);
    for(int k=0;k<6;k++) users[users_n].counts[k]=0;
    return users_n++;
}

/* ---------- Main ---------- */
int main(int argc, char **argv){
    const char *csv_in   = (argc>1? argv[1]: DEFAULT_CSV_IN);
    const char *json_out = (argc>2? argv[2]: DEFAULT_JSON_OUT);
    const char *sum_out  = (argc>3? argv[3]: DEFAULT_SUMMARY_CSV);

    FILE *fp = fopen(csv_in, "rb");
    if(!fp){ fprintf(stderr,"Cannot open %s\n", csv_in); return 1; }

    // read header and discard
    CsvRow row;
    if(!read_row(fp, &row)){ fprintf(stderr,"Empty CSV\n"); fclose(fp); return 1; }
    free(row.answer); free(row.anon_user);

    int row_index=0;
    while(read_row(fp, &row)){
        row_index++;
        // trim anon_user whitespace
        // (copy and trim)
        for(char *p=row.anon_user; *p; ++p){ if(*p=='\r') *p=0; }
        char *u = row.anon_user;
        while(*u && isspace((unsigned char)*u)) u++;
        // parse answer -> values[], n
        int *vals=NULL, n=0;
        if(!parse_answer_cell(row.answer, &vals, &n)){
            // skip on parse error
            free(row.answer); free(row.anon_user);
            continue;
        }

        // expected (reference)
        StrBuf exp; sb_init(&exp);
        SmallestEven_ref(vals, n, &exp);
        sb_append_char(&exp, 0); // ensure
        if(!exp.data) exp.data = strdup("");

        normalize_output_inplace(exp.data);

        // run all buggy and join with "||||"
        StrBuf all; sb_init(&all);
        StrBuf tmp; sb_init(&tmp);

        SmallestEven_1(vals, n, &tmp); sb_append_char(&tmp, 0); normalize_output_inplace(tmp.data?tmp.data:(char*)"");
        if(tmp.data && tmp.data[0]) sb_append_str(&all, tmp.data);
        sb_append_str(&all, "||||"); free(tmp.data); sb_init(&tmp);

        SmallestEven_2(vals, n, &tmp); sb_append_char(&tmp, 0); normalize_output_inplace(tmp.data?tmp.data:(char*)"");
        if(tmp.data && tmp.data[0]) sb_append_str(&all, tmp.data);
        sb_append_str(&all, "||||"); free(tmp.data); sb_init(&tmp);

        SmallestEven_3(vals, n, &tmp); sb_append_char(&tmp, 0); normalize_output_inplace(tmp.data?tmp.data:(char*)"");
        if(tmp.data && tmp.data[0]) sb_append_str(&all, tmp.data);
        sb_append_str(&all, "||||"); free(tmp.data); sb_init(&tmp);

        SmallestEven_4(vals, n, &tmp); sb_append_char(&tmp, 0); normalize_output_inplace(tmp.data?tmp.data:(char*)"");
        if(tmp.data && tmp.data[0]) sb_append_str(&all, tmp.data);
        sb_append_str(&all, "||||"); free(tmp.data); sb_init(&tmp);

        SmallestEven_5(vals, n, &tmp); sb_append_char(&tmp, 0); normalize_output_inplace(tmp.data?tmp.data:(char*)"");
        if(tmp.data && tmp.data[0]) sb_append_str(&all, tmp.data);
        free(tmp.data);

        // split and compare
        StringList segs = split_on_token_and_normalize(all.data?all.data:"", "||||");

        int idx_user = find_or_add_user(u);
        // increment constraint slot if segment != expected
        for(int i=0;i<segs.count; i++){
            if(strcmp(segs.items[i], exp.data)!=0){
                int cslot = i+1; if(cslot>=1 && cslot<=5) users[idx_user].counts[cslot]++;
            }
            free(segs.items[i]);
        }
        free(segs.items);

        free(all.data); free(exp.data);
        free(vals);
        free(row.answer); free(row.anon_user);
    }
    fclose(fp);

    /* ---- Write JSON summary ---- */
    FILE *fj = fopen(json_out, "wb");
    if(!fj){ fprintf(stderr,"Cannot write %s\n", json_out); return 1; }
    fprintf(fj, "{\n");
    for(int i=0;i<users_n;i++){
        fprintf(fj, "  \"%s\": {", users[i].user);
        for(int c=1;c<=5;c++){
            fprintf(fj, "\"%d\": %d%s", c, users[i].counts[c], (c<5? ", ":""));
        }
        fprintf(fj, "}%s\n", (i<users_n-1? ",":""));
    }
    fprintf(fj, "}\n");
    fclose(fj);

    /* ---- Write CSV summary (one line per user: how many of the 5 constraints mismatched at least once) ---- */
    FILE *fc = fopen(sum_out, "wb");
    if(!fc){ fprintf(stderr,"Cannot write %s\n", sum_out); return 1; }
    fprintf(fc, "anon_user,constraints_found,out_of\n");
    for(int i=0;i<users_n;i++){
        int found=0;
        for(int c=1;c<=5;c++) if(users[i].counts[c]>0) found++;
        fprintf(fc, "%s,%d,5\n", users[i].user, found);
    }
    fclose(fc);

    // cleanup
    for(int i=0;i<users_n;i++) free(users[i].user);
    free(users);

    printf("Done. Wrote %s and %s\n", json_out, sum_out);
    return 0;
}
