import { accountRequest, checkSession, currentToken } from "./account-client";
import { ApiError } from "./api";
import { amount } from "./backend-data";

export async function requestWithdrawal(value: number) {
  if (!Number.isFinite(value) || value <= 0 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001) throw new ApiError("Enter a positive amount with up to two decimal places.", 400, null);
  const token = currentToken();
  const summary = await accountRequest("/payouts/summary");
  checkSession(token);
  const available = amount(summary, ["available_balance", "available_to_withdraw", "withdrawable_balance"]);
  if (available === null) throw new ApiError("Your available payout balance could not be confirmed. Refresh before withdrawing.", 400, null);
  if (Math.round(value * 100) > Math.round(available * 100)) throw new ApiError("This amount exceeds your current available payout balance.", 400, null);
  return accountRequest("/payouts/withdrawals", { method: "POST", body: JSON.stringify({ amount: value }) });
}
