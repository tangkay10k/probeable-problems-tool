import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useEffect, useMemo, useState } from "react";
import Input from "@/components/inputs/text-input.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import styles from "./leaderboard.module.css";

export default function LeaderboardTable({ rows, meEmail }) {
  const apiRef = useGridApiRef();
  const [query, setQuery] = useState("");

  const rowsWithRank = useMemo(
    () =>
      rows.map((r, i) => ({
        ...r,
        rank: `${"#"} ${i + 1}`,
        score: r.points ?? 0,
      })),
    [rows],
  );

  useEffect(() => {
    const idx = rowsWithRank.findIndex((r) => r.email === meEmail);
    if (idx >= 0 && apiRef.current) {
      apiRef.current.scrollToIndexes({ rowIndex: idx, colIndex: 0 });
      apiRef.current.setRowSelectionModel([meEmail]);
    }
  }, [rowsWithRank, meEmail]);

  const columns = [
    {
      field: "rank",
      headerName: "Rank",
      width: 120,
      headerAlign: "left",
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <EmojiEventsIcon fontSize="small" color={"warning"} />
          <span className={styles.headerLabel}>Rank</span>
        </Stack>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      headerAlign: "left",
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <PersonOutlineIcon fontSize="small" color={"success"} />
          <span className={styles.headerLabel}>Name</span>
        </Stack>
      ),
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Avatar
            src={params.row.userImage || undefined}
            alt={params.row.name || params.row.email}
            sx={{ width: 28, height: 28, fontSize: 12 }}
          />
          <span>{params.row.name}</span>
        </Stack>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      headerAlign: "left",
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <AlternateEmailIcon fontSize="small" color={"info"} />
          <span className={styles.headerLabel}>Email</span>
        </Stack>
      ),
    },
    {
      field: "score",
      headerName: "Dennies",
      width: 150,
      headerAlign: "left",
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <img src="/coin.png" alt="Dennies" className={styles.denniesIcon} />
          <span className={styles.headerLabel}>Dennies</span>
        </Stack>
      ),
    },
  ];
  return (
    <div className={styles.tableContainer}>
      <section className={styles.searchbar}>
        <Input
          className={styles.searchInput}
          placeholder="Search leaderboard…"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            apiRef.current?.setQuickFilterValues(
              val.trim() ? val.split(" ") : [],
            );
          }}
        />
        <ButtonV2
          className={styles.jumpToMeBtn}
          onClick={() => {
            const idx = rowsWithRank.findIndex((r) => r.email === meEmail);
            if (idx >= 0 && apiRef.current) {
              apiRef.current.scrollToIndexes({ rowIndex: idx, colIndex: 0 });
              apiRef.current.setRowSelectionModel([meEmail]);
            }
          }}
        >
          Jump to me
        </ButtonV2>
      </section>

      <div className={styles.dataGridContainer}>
        <DataGrid
          apiRef={apiRef}
          rows={rowsWithRank}
          getRowId={(row) => row.email}
          columns={columns}
          disableColumnResize
          disableColumnMenu
          disableRowSelectionOnClick
          disableColumnSelector
          onRowSelectionModelChange={() => {}}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
        />
      </div>
    </div>
  );
}
