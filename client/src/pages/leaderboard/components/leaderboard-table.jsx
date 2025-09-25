import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useMemo, useState } from "react";
import Input from "@/components/inputs/text-input.jsx";
import styles from "./leaderboard.module.css";

export default function LeaderboardTable({ rows, meEmail }) {
  const apiRef = useGridApiRef();
  const [query, setQuery] = useState("");

  // control pagination so we can set page precisely
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const rowsWithRank = useMemo(
    () =>
      rows.map((r, i) => ({
        ...r,
        rank: `${"#"} ${i + 1}`,
        score: r.points ?? 0,
      })),
    [rows],
  );

  const columns = [
    {
      field: "rank",
      headerName: "Rank",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <EmojiEventsIcon fontSize="small" color={"warning"} />
          <span>Rank</span>
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
          <span>Name</span>
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
      field: "score",
      headerName: "Dennies",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <img src="/coin.png" alt="Dennies" className={styles.denniesIcon} />
          <span>Dennies</span>
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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
        />
      </div>
    </div>
  );
}
