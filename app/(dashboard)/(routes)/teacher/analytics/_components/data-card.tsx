import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format"; // ya jahan bhi tumhara utility function ho

interface DataCardProps {
    value: number;
    label: string;
    shouldFormat? : boolean;
}
export const DataCard = ({
    value,
    label,
    shouldFormat,
}:DataCardProps )=>{
    return(
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {label}
                </CardTitle>

            </CardHeader>
            
            <CardContent>
                <div className="text-2xl font-medium">
                    {shouldFormat ? formatPrice(value) :value}
                </div>
                
            </CardContent>
        </Card>
    )
}