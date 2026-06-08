import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

function BRSDetails({ setActivePage }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "brs", id),
      (snapshot) => {
        setRecord(
          snapshot.exists()
            ? { id: snapshot.id, ...snapshot.data() }
            : null
        );
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "commissionVouchers"),
      (snapshot) => {
        const records = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter((item) => item.brsDocId === id)
          .sort((a, b) => {
            const dateA =
              a.createdAt?.toMillis?.() ||
              new Date(a.voucherDate || 0).getTime();
            const dateB =
              b.createdAt?.toMillis?.() ||
              new Date(b.voucherDate || 0).getTime();

            return dateB - dateA;
          });

        setVouchers(records);
      },
      (error) => {
        console.error(error);
        alert(error.message);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const summary = useMemo(
    () => getPaymentSummary(record, vouchers),
    [record, vouchers]
  );

  const handleBack = () => {
    if (setActivePage) {
      setActivePage("brs");
      return;
    }

    navigate(-1);
  };

  const handleProceedToCommission = () => {
    if (!record) {
      return;
    }

    localStorage.setItem(
      "selectedBuyer",
      JSON.stringify({
        ...record,
        buyerName: record.buyer,
        amount: getRecordAmount(record),
      })
    );

    navigate("/RateDistribution");
  };

  if (loading) {
    return (
      <section className="bg-[#f4f7fb] min-h-screen p-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-gray-500">
          Loading BRS details...
        </div>
      </section>
    );
  }

  if (!record) {
    return (
      <section className="bg-[#f4f7fb] min-h-screen p-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-gray-500">
          BRS record not found.
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f4f7fb] min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0d1b4c]">
            BRS NO. {record.brsId || "-"}
          </h1>
          <p className="text-gray-500 mt-2">
            Buyer Registration Details
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl font-semibold"
          >
            Back
          </button>
          <button
            onClick={handleProceedToCommission}
            className="bg-[#0d1b4c] hover:bg-[#09122f] text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            Proceed to Commission
          </button>
        </div>
      </div>

      <DetailsSection title="BUYER'S REGISTRATION SHEET">
        <Input label="Tripping Date" value={record.trippingDate} />
        <Input label="Closing Date" value={record.closedAt} />
        <Input label="Posted" value={record.postedAt} />
        <Input label="HLC Code" value={record.hlcCode} />
        <Input label="Team Name" value={record.teamName} />
      </DetailsSection>

      <DetailsSection title="BUYER'S INFORMATION">
        <Input label="Full Name" value={record.buyer} />
        <Input label="Address" value={record.buyerAddress} />
        <Input label="Mobile" value={record.buyerMobile} />
        <Input label="Email" value={record.buyerEmail} />
        <Input label="Birthdate" value={record.buyerBirthdate} />
        <Input label="Age" value={record.buyerAge} />
      </DetailsSection>

      <DetailsSection title="PROPERTY DETAILS">
        <Input label="Developer" value={record.developer} />
        <Input label="Project" value={record.project} />
        <Input label="LTS" value={record.lts} />
        <Input label="Project Location" value={record.projectLocation} />
        <Input label="Direct" value={record.direct} />
        <Input label="Phase" value={record.phase} />
        <Input label="Block" value={record.block} />
        <Input label="Lot" value={record.lot} />
        <Input label="Lot Area (SQM)" value={record.lotArea} />
        <Input label="Floor Area (SQM)" value={record.floorArea} />
        <Input label="Model Unit" value={record.modelUnit} />
      </DetailsSection>

      <DetailsSection title="ACCOUNT DETAILS">
        <Input label="TCP" value={formatCurrency(getNumber(record.tcp))} />
        <Input label="Total DP" value={formatCurrency(getNumber(record.totalDp))} />
        <Input label="Financing Scheme" value={record.financingScheme} />
        <Input label="NSP" value={formatCurrency(getNumber(record.nsp))} />
        <Input label="Reservation" value={formatCurrency(getNumber(record.reservation))} />
        <Input label="Payment Terms" value={record.paymentTerms} />
        <Input label="Loan Value" value={formatCurrency(getNumber(record.loanValue))} />
        <Input label="Monthly DP" value={formatCurrency(getNumber(record.monthlyDp))} />
        <Input label="Monthly Amortization" value={formatCurrency(getNumber(record.monthlyAmortization))} />
      </DetailsSection>

      <DetailsSection title="RATE DISTRIBUTION">
        {(record.rateDistribution || []).map((row, index) => (
          <Input
            key={`${row.role}-${index}`}
            label={row.role}
            value={`${row.rate || 0}${row.name ? ` - ${row.name}` : ""}`}
          />
        ))}
      </DetailsSection>

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <label className="flex items-center gap-3 mb-3 font-medium text-gray-700">
          <input type="checkbox" checked={Boolean(record.wrongInput)} readOnly />
          Wrong Input
        </label>
        <Label>Notes</Label>
        <textarea
          rows="5"
          value={record.notes || ""}
          readOnly
          className="w-full border border-gray-300 rounded-2xl p-5 outline-none resize-none bg-gray-50"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          <Input label="Amount Due" value={formatCurrency(summary.amountDue)} />
          <Input label="Received" value={formatCurrency(summary.received)} />
          <Input
            label="Received %"
            value={`${summary.receivedPercent.toFixed(0)}%`}
          />
          <Input
            label="Developer Deductions"
            value={formatCurrency(summary.developerDeductions)}
          />
          <Input label="Balance" value={formatCurrency(summary.balance)} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5]">
            <tr className="text-left text-gray-600">
              <th className="p-5">Date</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Commission</th>
              <th className="p-5">Notes</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-8 text-center text-gray-500"
                >
                  No commission vouchers recorded for this BRS yet.
                </td>
              </tr>
            )}

            {vouchers.map((voucher) => (
              <tr
                key={voucher.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-5">{voucher.voucherDate || "-"}</td>
                <td className="p-5">{formatCurrency(voucher.amount)}</td>
                <td className="p-5">
                  {formatCurrency(voucher.commissionAmount)}
                </td>
                <td className="p-5">{voucher.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getNumber(value) {
  return Number(String(value || "").replace(/,/g, "")) || 0;
}

function getRecordAmount(record) {
  return getNumber(record?.amount) || getNumber(record?.tcp) || getNumber(record?.nsp);
}

function getDeveloperRate(record) {
  return (
    Number(
      record?.rateDistribution?.find(
        (row) => row.role?.toLowerCase() === "developer"
      )?.rate
    ) || 0
  );
}

function getAmountDue(record) {
  const savedAmountDue = getNumber(record?.amountDue);

  if (savedAmountDue) {
    return savedAmountDue;
  }

  return getRecordAmount(record) * (getDeveloperRate(record) / 100);
}

function getPaymentSummary(record, vouchers) {
  const amountDue = getAmountDue(record);
  const received = vouchers.reduce(
    (total, voucher) =>
      total + (getNumber(voucher.commissionAmount) || getNumber(voucher.amount)),
    0
  );
  const developerDeductions = getNumber(record?.developerDeductions);
  const balance = amountDue - received - developerDeductions;
  const receivedPercent = amountDue ? (received / amountDue) * 100 : 0;

  return {
    amountDue,
    received,
    developerDeductions,
    balance,
    receivedPercent,
  };
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DetailsSection({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
      <div className="bg-[#2563eb] px-8 py-4">
        <h2 className="text-white text-lg font-bold">{title}</h2>
      </div>
      <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-sm font-semibold text-gray-500 mb-2">
      {children}
    </label>
  );
}

function Input({ label, value }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value || "-"}
        readOnly
        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none bg-gray-50"
      />
    </div>
  );
}

export default BRSDetails;
