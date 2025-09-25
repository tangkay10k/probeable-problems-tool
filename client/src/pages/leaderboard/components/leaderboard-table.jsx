import {
  DataGrid,
  gridFilteredSortedRowIdsSelector,
  useGridApiRef,
} from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useEffect, useMemo, useRef, useState } from "react";
import Input from "@/components/inputs/text-input.jsx";
import styles from "./leaderboard.module.css";
import { useUserProfile } from "@/context/user-context.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";

export default function LeaderboardTable({ rows }) {
  const apiRef = useGridApiRef();
  const [query, setQuery] = useState("");
  const { profile } = useUserProfile();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 25,
    page: 0,
  });

  const pendingRowIndexRef = useRef(null);

  useEffect(() => {
    if (pendingRowIndexRef.current !== null) {
      const id = requestAnimationFrame(() => {
        apiRef.current.scrollToIndexes({
          rowIndex: pendingRowIndexRef.current,
        });
        pendingRowIndexRef.current = null;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [paginationModel.page, apiRef]);

  const handleJumpToRow = () => {
    const targetId = profile?.email;
    if (!targetId) return;

    const allIds = gridFilteredSortedRowIdsSelector(apiRef);
    const absoluteIndex = allIds.indexOf(targetId);
    if (absoluteIndex === -1) {
      console.log(`Row with ID ${targetId} not found in current filter.`);
      return;
    }

    const { pageSize, page } = paginationModel;
    const targetPage = Math.floor(absoluteIndex / pageSize);
    const indexOnPage = absoluteIndex % pageSize;

    if (targetPage === page) {
      // Same page: scroll immediately
      requestAnimationFrame(() => {
        apiRef.current.scrollToIndexes({ rowIndex: indexOnPage });
      });
    } else {
      // Different page: remember row index and update page
      pendingRowIndexRef.current = indexOnPage;
      setPaginationModel((prev) => ({ ...prev, page: targetPage }));
    }
  };

  const rowsWithRank = useMemo(
    () =>
      rows.map((r, i) => ({
        ...r,
        rank: `${"#"} ${i + 1}`,
        score: r.points ?? 0,
        email: r?.email || crypto.randomUUID(),
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
      headerClassName: styles.centerHeader,
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <EmojiEventsIcon fontSize="small" color={"warning"} />
          <span>Rank</span>
        </Stack>
      ),
    },
    {
      field: "name",
      headerName: "name",
      flex: 1,
      headerAlign: "left",
      headerClassName: styles.centerHeader,
      renderHeader: () => (
        <Stack direction="row" alignItems="center" gap={0.75}>
          <PersonOutlineIcon fontSize="small" color={"success"} />
          <span>User</span>
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
      headerClassName: styles.centerHeader,
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
        <ButtonV2 onClick={handleJumpToRow} className={styles.jumpToMeBtn}>
          Jump to me!
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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
          getRowClassName={(params) =>
            params.id === profile?.email ? styles.meRow : ""
          }
        />
      </div>
    </div>
  );
}
