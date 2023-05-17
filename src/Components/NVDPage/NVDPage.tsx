import React, { useState, useEffect } from "react";
import "./NVDPage.css";
import NavBar from "../NavBar/NavBar";
import CVECard, { ICVE, metricData } from "../CVECard/CVECard";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import SeverityCard from "../SeverityCard/SeverityCard";
import { DlinkCves } from "../../store/slices/DlinkSlice";
import { HikvisionCves } from "../../store/slices/HikvisionSlice";
import { OpenwrtCves } from "../../store/slices/OpenwrtSlice";
import { useParams } from "react-router-dom";

interface BaseSeverity {
	HIGH: number;
	MEDIUM: number;
	LOW: number;
	[key: string]: number;
}

const NVDPage: React.FC = () => {
	const { companyName } = useParams<string>();
	const openwrtCves = useSelector(
		(state: RootState) => state.OpenwrtCves.value
	);
	const dlinkCves = useSelector((state: RootState) => state.DlinkCves.value);
	const hikvisionCves = useSelector(
		(state: RootState) => state.HikvisionCves.value
	);

	let cves: ICVE[] = [];
	if (companyName === "openwrt") {
		cves = openwrtCves;
	} else if (companyName === "dlink") {
		cves = dlinkCves;
	} else if (companyName === "hikvision") {
		cves = hikvisionCves;
	}

	const dispatch = useDispatch();
	const initialValue: BaseSeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };
	const [baseSeverity, setBaseSeverity] = useState<BaseSeverity>(initialValue);

	useEffect(() => {
		setBaseSeverity(initialValue);
		const handleSeverity = (sev: string) => {
			setBaseSeverity((prevSeverity) => ({
				...prevSeverity,
				[sev]: prevSeverity[sev] + 1,
			}));
		};
		if (cves) {
			cves.forEach((cve: ICVE) => {
				const cveData: metricData[] | null = cve.cve.metrics.cvssMetricV2;
				if (cveData && cveData.length > 0) {
					handleSeverity(cveData[0].baseSeverity);
				}
			});
		}
	}, [companyName]);

	useEffect(() => {
		dispatch(DlinkCves());
		dispatch(HikvisionCves());
		dispatch(OpenwrtCves());
	}, []);

	return (
		<div className="nvd-page">
			<NavBar />
			<div className={`logo-${companyName}`}></div>
			<div className="severity-cards">
				<SeverityCard
					type={"issues"}
					count={cves.length}
					company={companyName ? companyName : ""}
				/>
				{Object.entries(baseSeverity).map(([key, value]) => (
					<SeverityCard
						key={key}
						type={key}
						count={value}
						company={companyName ? companyName : ""}
					/>
				))}
			</div>
			<div className="cve-content">
				{cves &&
					cves.map((cve: ICVE, index: number) => (
						<CVECard
							key={index}
							descriptions={cve.cve.descriptions}
							id={cve.cve.id}
							lastModified={cve.cve.lastModified}
							published={cve.cve.published}
							references={cve.cve.references}
							sourceIdentifier={cve.cve.sourceIdentifier}
							vulnStatus={cve.cve.vulnStatus}
							weaknesses={cve.cve.weaknesses}
							metrics={cve.cve.metrics}
						/>
					))}
			</div>
		</div>
	);
};

export default NVDPage;
