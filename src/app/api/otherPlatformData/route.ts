// app/api/jobs/route.ts
import { getDataFromToken } from '@/helper/getDataFromToken';
import { NextRequest, NextResponse } from 'next/server';


interface JobData {
  job_title: string;
  employer_name: string;
  employer_logo: string;
  job_employment_type: string;
  job_posted_at: string;
  job_location: string;
  job_country: string;
  job_id: string;
  job_apply_link: string;
}

function extractJobFields(rawJobs: any[]): JobData[] {
  return rawJobs.map(job => ({
    job_id: job.job_id,
    job_title: job.job_title,
    employer_name: job.employer_name,
    employer_logo: job.employer_logo || "https://via.placeholder.com/150",
    job_employment_type: job.job_employment_type,
    job_posted_at: job.job_posted_at,
    job_location: job.job_location,
    job_country: job.job_country,
    job_apply_link: job.job_apply_link,
  }));
}

export async function GET(request:NextRequest) {

  // const userID = getDataFromToken(request);
      // if (!userID) throw new Error("User unauthorized");

  const { searchParams } = new URL(request.url);
  
  // Extract query parameters with defaults
  const query = searchParams.get('searchQuery') || 'developer jobs in chicago';
  const page = searchParams.get('page') || '1';
  const num_pages = searchParams.get('num_pages') || '1';
  const country = searchParams.get('country') || 'In';
  const date_posted = searchParams.get('date_posted') || 'all';

  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${Number(page)}&num_pages=${num_pages}&country=${country}&date_posted=${date_posted}&employment_types=CONTRACTOR`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.JSEARCH_API_KEY!,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `JSearch API error: ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();

 const cleanedJobs = extractJobFields(data.data || []);

 return NextResponse.json(cleanedJobs, { status: 200 });

  } catch (error) {
    if(error instanceof Error){
        return NextResponse.json(
          { error: 'Failed to fetch jobs', message: error.message },
          { status: 500 }
        );
    }
  }
}
