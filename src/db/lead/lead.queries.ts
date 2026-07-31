import { supabase } from "../supabase.js";
import { type Lead, type LeadRow, fromRow, toRow } from "./lead.types.js";

export async function insertLead(lead: Lead): Promise<void> {
  const { error } = await supabase.from("leads").insert(toRow(lead));
  if (error) throw error;
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as LeadRow[]).map(fromRow);
}

export async function initStore(): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.warn("Supabase: unable to reach leads table —", error.message);
    return;
  }
  console.log("Supabase: leads store initialized");
}
