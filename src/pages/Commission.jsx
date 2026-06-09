import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

function Commission() {
  const navigate = useNavigate();
  const restoredVoucherBatch = readSelectedVoucherBatch();
  const [brsRecords, setBrsRecords] = useState([]);
  const [voucherRecords, setVoucherRecords] = useState([]);
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBuyerName, setSelectedBuyerName] = useState('');
  const [selectedBRSId, setSelectedBRSId] = useState('');
  const [voucherGrossAmount, setVoucherGrossAmount] = useState(
    restoredVoucherBatch?.voucherGrossAmount
      ? String(restoredVoucherBatch.voucherGrossAmount)
      : ''
  );
  const [buyerAssignedAmount, setBuyerAssignedAmount] = useState('');
  const [voucherDate, setVoucherDate] = useState(
    restoredVoucherBatch?.voucherDate &&
      restoredVoucherBatch.voucherDate !== "-"
      ? restoredVoucherBatch.voucherDate
      : ''
  );
  const [remarks, setRemarks] = useState('');
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [currentVoucherBatchId, setCurrentVoucherBatchId] =
    useState(() => restoredVoucherBatch?.voucherBatchId || createVoucherBatchId());
  const [currentVoucherIds, setCurrentVoucherIds] = useState(
    () => restoredVoucherBatch?.buyers?.map((buyer) => buyer.id).filter(Boolean) || []
  );
  const [savingVoucher, setSavingVoucher] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "brs"),
      (snapshot) => {
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBrsRecords(records);
      },
      (error) => {
        console.error(error);
        alert(error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "commissionVouchers"),
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        records.sort((a, b) => {
          const dateA =
            a.createdAt?.toMillis?.() ||
            new Date(a.voucherDate || 0).getTime();
          const dateB =
            b.createdAt?.toMillis?.() ||
            new Date(b.voucherDate || 0).getTime();

          return dateB - dateA;
        });

        setVoucherRecords(records);
        setVoucherLoading(false);
      },
      (error) => {
        console.error(error);
        alert(error.message);
        setVoucherLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const uniqueValues = (field, records = brsRecords) =>
    [...new Set(records.map((record) => record[field]).filter(Boolean))];

  const selectedRecord = brsRecords.find(
    (record) => record.id === selectedBRSId
  );

  const currentVoucherRecords = voucherRecords.filter((record) =>
    record.voucherBatchId === currentVoucherBatchId ||
    currentVoucherIds.includes(record.id)
  );

  const filteredVoucherRecords = currentVoucherRecords.filter((record) => {
    const searchValue = recordSearch.toLowerCase();

    return [
      record.brsId,
      record.buyer,
      record.project,
      record.voucherDate,
      record.remarks,
      record.status,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));
  });

  const getNumber = (value) =>
    Number(String(value || "").replace(/,/g, "")) || 0;

  const voucherGrossTotal =
    getNumber(voucherGrossAmount) || getNumber(currentVoucherRecords[0]?.amount);

  const buyerAssignedTotal = currentVoucherRecords.reduce(
    (total, record) => total + getNumber(record.commissionAmount),
    0
  );

  const voucherBalance = voucherGrossTotal - buyerAssignedTotal;
  const isVoucherTallied =
    voucherGrossTotal > 0 && Math.abs(voucherBalance) < 0.01;

  const getRecordAmount = (record) =>
    getNumber(record?.amount) || getNumber(record?.tcp) || getNumber(record?.nsp);

  const getDeveloperRate = (record) =>
    Number(
      record?.rateDistribution?.find(
        (row) => row.role?.toLowerCase() === "developer"
      )?.rate
    ) || 0;

  const getCommissionAmount = (record) => {
    const savedAmountDue = getNumber(record?.amountDue);

    if (savedAmountDue) {
      return savedAmountDue;
    }

    return getRecordAmount(record) * (getDeveloperRate(record) / 100);
  };

  const handleDeveloperChange = (value) => {
    setSelectedDeveloper(value);
    setSelectedProject('');
    setSelectedBuyerName('');
    setSelectedBRSId('');
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
    setSelectedBuyerName('');
    setSelectedBRSId('');
  };

  const handleBuyerChange = (value) => {
    setSelectedBuyerName(value);
    setSelectedBRSId('');
    setBuyerAssignedAmount('');
  };

  const handleBRSChange = (value) => {
    const record = brsRecords.find((item) => item.id === value);

    setSelectedBRSId(value);
    setBuyerAssignedAmount(
      record ? String(getCommissionAmount(record) || "") : ""
    );
  };

  const clearForm = () => {
    setSelectedDeveloper('');
    setSelectedProject('');
    setSelectedBuyerName('');
    setSelectedBRSId('');
    setVoucherGrossAmount('');
    setBuyerAssignedAmount('');
    setVoucherDate('');
    setRemarks('');
    setVoucherFile(null);
    setVoucherPreview('');
  };

  const clearBuyerSelection = () => {
    setSelectedDeveloper('');
    setSelectedProject('');
    setSelectedBuyerName('');
    setSelectedBRSId('');
    setBuyerAssignedAmount('');
  };

  const resetVoucherSession = () => {
    clearForm();
    localStorage.removeItem("selectedVoucherBatch");
    localStorage.removeItem("selectedBuyer");
    setRecordSearch('');
    setSelectedVoucherId('');
    setCurrentVoucherIds([]);
    setCurrentVoucherBatchId(createVoucherBatchId());
  };

  const handleVoucherUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setVoucherFile(file);

    if (!file.type.startsWith("image/")) {
      setVoucherPreview('');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setVoucherPreview(String(reader.result || ""));
    };

    reader.readAsDataURL(file);
  };

  const handleSaveVoucher = async () => {
    if (!selectedRecord) {
      alert("Please select a BRS record first.");
      return;
    }

    if (!voucherDate) {
      alert("Please select a voucher date.");
      return;
    }

    const grossAmount = getNumber(voucherGrossAmount);
    const assignedAmount = getNumber(buyerAssignedAmount);
    const nextAssignedTotal = buyerAssignedTotal + assignedAmount;

    if (!grossAmount) {
      alert("Please enter the voucher gross commission.");
      return;
    }

    if (!assignedAmount) {
      alert("Please enter the buyer assigned amount.");
      return;
    }

    if (nextAssignedTotal > grossAmount) {
      alert("Total buyer amount cannot be greater than voucher gross commission.");
      return;
    }

    try {
      setSavingVoucher(true);

      const voucherDoc = await addDoc(collection(db, "commissionVouchers"), {
        voucherBatchId: currentVoucherBatchId,
        voucherNo: currentVoucherBatchId,
        brsDocId: selectedRecord.id,
        brsId: selectedRecord.brsId || "",
        buyer: selectedRecord.buyer || "",
        developer: selectedRecord.developer || "",
        project: selectedRecord.project || "",
        phase: selectedRecord.phase || "",
        block: selectedRecord.block || "",
        lot: selectedRecord.lot || "",
        amount: grossAmount,
        commissionAmount: assignedAmount,
        voucherDate,
        remarks,
        voucherFileName: voucherFile?.name || "",
        voucherFileType: voucherFile?.type || "",
        voucherPreview,
        status: "For Release",
        computationStatus: "Pending",
        createdAt: serverTimestamp(),
      });

      setSelectedVoucherId(voucherDoc.id);
      setCurrentVoucherIds((current) => [voucherDoc.id, ...current]);
      alert("Voucher recorded successfully.");
      clearBuyerSelection();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    const shouldDelete = window.confirm(
      "Delete this voucher release record?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, "commissionVouchers", voucherId));
      setCurrentVoucherIds((current) =>
        current.filter((id) => id !== voucherId)
      );

      if (selectedVoucherId === voucherId) {
        setSelectedVoucherId('');
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const getBrsRecordForVoucher = (voucher) =>
    brsRecords.find((record) => record.id === voucher?.brsDocId);

  const handleCompute = (record, voucher = null) => {
    if (!record) {
      alert("Please select a BRS record first.");
      return;
    }

    const calculationAmount = voucher
      ? getNumber(voucher.commissionAmount)
      : getRecordAmount(record);

    localStorage.setItem(
      'selectedBuyer',
      JSON.stringify({
        ...record,
        selectedVoucherId: voucher?.id || "",
        voucherDate: voucher?.voucherDate || "",
        voucherRemarks: voucher?.remarks || "",
        buyerName: record.buyer,
        amount: calculationAmount,
      })
    );

    navigate('/RateDistribution');
  };

  const handleComputeVoucher = (voucher) => {
    setSelectedVoucherId(voucher.id);
    handleCompute(getBrsRecordForVoucher(voucher), voucher);
  };

  const handleCalculateSelectedVoucher = () => {
    const vouchersToCalculate = currentVoucherRecords;

    if (vouchersToCalculate.length === 0) {
      alert("Please add or select a release record first.");
      return;
    }

    if (!voucherGrossTotal) {
      alert("Please enter the voucher gross commission.");
      return;
    }

    if (!isVoucherTallied) {
      alert(
        `Voucher gross commission must tally with total buyer amount. Gross: P${voucherGrossTotal.toLocaleString()}, Total Buyer Amount: P${buyerAssignedTotal.toLocaleString()}.`
      );
      return;
    }

    localStorage.removeItem("selectedBuyer");
    localStorage.setItem(
      "selectedVoucherBatch",
      JSON.stringify({
        voucherBatchId: currentVoucherBatchId,
        voucherNo: currentVoucherBatchId,
        voucherDate: vouchersToCalculate[0]?.voucherDate || voucherDate,
        voucherGrossAmount: voucherGrossTotal,
        buyerAssignedTotal,
        buyers: vouchersToCalculate.map((voucher) => ({
          ...voucher,
          brsRecord: getBrsRecordForVoucher(voucher),
        })),
      })
    );

    navigate('/RateDistribution');
  };

  return (
    <section className="p-8 bg-[#f5f5f5] min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-4xl font-black text-[#0d1b4c]">
            Add Voucher
          </h1>

          <p className="text-gray-500 mt-2">
            Create a voucher from an existing BRS buyer record.
          </p>

        </div>

      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-[30px] shadow-xl p-8">

        <div className="grid xl:grid-cols-2 gap-10">

          {/* LEFT FORM */}
          <div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* DEVELOPER */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Developer
                </label>

                <select
                  value={selectedDeveloper}
                  onChange={(e) => handleDeveloperChange(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Developer</option>
                  {uniqueValues("developer").map((developer) => (
                    <option key={developer} value={developer}>
                      {developer}
                    </option>
                  ))}
                </select>

              </div>

              {/* PROJECT */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Project
                </label>

                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Project</option>
                  {uniqueValues(
                    "project",
                    brsRecords.filter(
                      (record) => record.developer === selectedDeveloper
                    )
                  ).map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>

              </div>

              {/* BUYER */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Buyer's Name
                </label>

                <select
                  value={selectedBuyerName}
                  onChange={(e) => handleBuyerChange(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Buyer</option>
                  {uniqueValues(
                    "buyer",
                    brsRecords.filter(
                      (record) => record.project === selectedProject
                    )
                  ).map((buyer) => (
                    <option key={buyer} value={buyer}>
                      {buyer}
                    </option>
                  ))}
                </select>

              </div>

              {/* PHASE */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Phase / Block / Lot
                </label>

                <select
                  value={selectedBRSId}
                  onChange={(e) => handleBRSChange(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Phase / Block / Lot</option>
                  {brsRecords
                  .filter((record) => record.project === selectedProject)
                  .filter((record) => record.buyer === selectedBuyerName)
                  .map((record)=> (
                    <option key={record.id} value={record.id}>
                      Phase {record.phase || "-"} / Block {record.block || "-"} / Lot {record.lot || "-"}
                    </option>
                  ))} 
                </select>

              </div>

              {/* BUYER ASSIGNED AMOUNT */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Buyer Assigned Amount
                </label>

                <input
                  type="text"
                  value={buyerAssignedAmount}
                  onChange={(e) => setBuyerAssignedAmount(e.target.value)}
                  placeholder="Amount assigned to selected buyer"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                />

              </div>

              {/* DATE */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Voucher Date
                </label>

                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                />

              </div>

              {/* REMARKS */}
              <div className="md:col-span-2">

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Remarks
                </label>

                <textarea
                  rows="5"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks here..."
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    resize-none
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                ></textarea>

              </div>

            </div>

            {/* FORM BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={handleSaveVoucher}
                disabled={savingVoucher}
                className="
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  shadow-lg
                  transition-all
                  disabled:opacity-60
                "
              >
                {savingVoucher ? "ADDING..." : "ADD"}
              </button>

              <button
                onClick={clearForm}
                className="
                  bg-gray-200
                  hover:bg-gray-300
                  text-black
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  transition-all
                "
              >
                CLEAR
              </button>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div>

            <div
              className="
                border-2
                border-dashed
                border-gray-300
                rounded-[30px]
                overflow-hidden
                h-[420px]
                bg-gray-100
                relative
              "
            >

              {voucherPreview ? (
                <img
                  src={voucherPreview}
                  alt="Voucher preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center p-8 text-center">
                  <div>
                    <p className="text-xl font-bold text-[#0d1b4c]">
                      {voucherFile?.name || "No voucher uploaded"}
                    </p>
                    <p className="text-gray-500 mt-2">
                      {voucherFile
                        ? "File selected and ready to add."
                        : "Upload commission voucher or proof of release."}
                    </p>
                  </div>
                </div>
              )}

              {/* OVERLAY */}
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  w-full
                  bg-gradient-to-t
                  from-black/70
                  to-transparent
                  p-6
                "
              >

                <p className="text-white text-lg font-semibold">
                  Voucher Preview
                </p>

                <p className="text-white/70 text-sm mt-1">
                  Upload commission voucher or proof of release.
                </p>

              </div>

            </div>

            {/* UPLOAD BUTTON */}
            <div className="mt-6 grid gap-4 md:grid-cols-[auto_1fr] md:items-end">
              <label
                className="
                  inline-flex
                  items-center
                  justify-center
                  bg-[#0d1b4c]
                  hover:bg-[#09122f]
                  text-white
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  shadow-lg
                  transition-all
                  cursor-pointer
                  "
              >
                Upload Voucher
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleVoucherUpload}
                  className="hidden"
                />
              </label>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Overall Gross Commission
                </label>

                <input
                  type="text"
                  value={voucherGrossAmount}
                  onChange={(e) => setVoucherGrossAmount(e.target.value)}
                  placeholder="Total gross commission per voucher"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                />
              </div>

            </div>

          </div>

        </div>

        {/* TABLE HEADER */}
        <div className="flex items-center justify-between mt-14 mb-5">

          <div>

            <h2 className="text-2xl font-bold text-[#0d1b4c]">
              Voucher Buyers
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Buyers added to this voucher before calculation.
            </p>

          </div>

          <input
            type="text"
            value={recordSearch}
            onChange={(e) => setRecordSearch(e.target.value)}
            placeholder="Search records..."
            className="
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              outline-none
              w-[260px]
              focus:ring-2
              focus:ring-[#0d1b4c]
            "
          />

        </div>

        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <SummaryTile label="Voucher Gross" value={`P${voucherGrossTotal.toLocaleString()}`} />
          <SummaryTile label="Assigned to Buyers" value={`P${buyerAssignedTotal.toLocaleString()}`} />
          <SummaryTile
            label={voucherBalance === 0 ? "Tallied" : "Remaining Buyer Amount"}
            value={`P${voucherBalance.toLocaleString()}`}
            valueClass={isVoucherTallied ? "text-emerald-700" : "text-orange-600"}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">

          <table className="w-full min-w-[850px]">

            <thead>

              <tr className="bg-[#0d1b4c] text-white text-left">

                <th className="p-5">BRS</th>
                <th className="p-5">Buyer</th>
                <th className="p-5">Project</th>
                <th className="p-5">Phase / Block / Lot</th>
                <th className="p-5">Buyer Amount</th>
                <th className="p-5">Status</th>
                <th className="p-5">Action</th>

              </tr>

            </thead>

            <tbody>

              {voucherLoading && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-gray-500"
                  >
                    Loading release records...
                  </td>
                </tr>
              )}

              {!voucherLoading && filteredVoucherRecords.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-gray-500"
                  >
                    No release records yet.
                  </td>
                </tr>
              )}

              {!voucherLoading && filteredVoucherRecords.map((voucher) => (

                <tr
                  key={voucher.id}
                  onClick={() => setSelectedVoucherId(voucher.id)}
                  className={`
                    border-b
                    border-gray-200
                    hover:bg-gray-50
                    transition-all
                    cursor-pointer
                    ${selectedVoucherId === voucher.id ? "bg-blue-50" : ""}
                  `}
                >

                  <td className="p-5 font-semibold text-[#0d1b4c]">
                    {voucher.brsId || "-"}
                  </td>

                  <td className="p-5 font-semibold">
                    {voucher.buyer || "-"}
                  </td>

                  <td className="p-5">
                    {voucher.project || "-"}
                  </td>

                  <td className="p-5">
                    Phase {voucher.phase || "-"} / Block {voucher.block || "-"} / Lot {voucher.lot || "-"}
                  </td>

                  <td className="p-5 font-bold text-emerald-700">
                    P{getNumber(voucher.commissionAmount).toLocaleString()}
                  </td>

                  <td className="p-5">
                    <StatusBadge status={voucher.computationStatus} />
                  </td>

                  <td className="p-5">

                    <div className="flex gap-3">

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleComputeVoucher(voucher);
                        }}
                        className="
                          bg-blue-500
                          hover:bg-blue-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          transition-all
                        "
                      >
                        Manage
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteVoucher(voucher.id);
                        }}
                        className="
                          bg-red-500
                          hover:bg-red-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          transition-all
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

            <tfoot>
              <tr className="bg-[#f3f4f6] font-bold text-[#0d1b4c]">
                <td className="p-5" colSpan="4">Total Buyer Amount</td>
                <td className="p-5 text-emerald-700">
                  P{buyerAssignedTotal.toLocaleString()}
                </td>
                <td className="p-5" colSpan="2">
                  {isVoucherTallied ? "Tallied with gross commission" : "Needs more buyer amount"}
                </td>
              </tr>
            </tfoot>

          </table>

        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={handleCalculateSelectedVoucher}
            className="
              bg-[#0d1b4c]
              hover:bg-[#09122f]
              text-white
              px-8
              py-3
              rounded-xl
              font-semibold
              transition-all
              shadow-lg
            "
          >
            Calculate
          </button>

          <button
            onClick={resetVoucherSession}
            className="
              bg-gray-200
              hover:bg-gray-300
              text-black
              px-8
              py-3
              rounded-xl
              font-semibold
              transition-all
            "
          >
            Cancel
          </button>

        </div>

      </div>

    </section>
  )
}

export default Commission

function SummaryTile({ label, value, valueClass = "text-[#0d1b4c]" }) {
  return (
    <div className="rounded-2xl bg-[#f5f6fa] p-4">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status = "Pending" }) {
  const done = status === "Done";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        done ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {done ? "Done" : "Pending"}
    </span>
  );
}

function createVoucherBatchId() {
  return `V-${Date.now()}`;
}

function readSelectedVoucherBatch() {
  try {
    return JSON.parse(localStorage.getItem("selectedVoucherBatch")) || null;
  } catch {
    return null;
  }
}

