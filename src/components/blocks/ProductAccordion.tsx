import React from 'react';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Badge } from '@/src/components/ui/Badge';
import { Card, CardContent } from '@/src/components/ui/Card';
import { cn } from '@/src/lib/utils';
import { Product } from '@/src/types';

interface ProductAccordionProps {
  product: Product;
}

export const ProductAccordion = ({ product }: ProductAccordionProps) => {
  return (
    <div className="mt-4 border-t border-border pt-2">
      <Accordion defaultValue={["description", "how-to-use"]} className="w-full">
        
        {/* Panel 1 — "Description" */}
        <AccordionItem value="description">
          <AccordionTrigger className="text-base font-medium hover:no-underline">Description</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed space-y-4">
            <div className="prose prose-sm max-w-none prose-p:mb-3" dangerouslySetInnerHTML={{ __html: product.description }} />
            
            {product.proTip && (
              <div className="bg-[#F9F7F4] p-4 rounded-lg flex gap-3 items-start mt-4 border border-[#EAE5DF]">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-sm mb-1">Pro Tip</h4>
                  <p className="text-sm">{product.proTip}</p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Panel 2 — "How to Use" */}
        <AccordionItem value="how-to-use">
          <AccordionTrigger className="text-base font-medium hover:no-underline">How to Use</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {product.routineStep && (
                <Badge variant="outline" className="font-normal">Step {product.routineStep} in your routine</Badge>
              )}
              {product.timeOfDay && (
                <Badge variant="outline" className="font-normal capitalize">Best used in the {product.timeOfDay}</Badge>
              )}
            </div>
            
            <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
              {product.applicationInstructions.map((step: string, idx: number) => (
                <li key={idx} className="pl-1">
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>

        {/* Panel 3 — "Key Ingredients" */}
        <AccordionItem value="ingredients">
          <AccordionTrigger className="text-base font-medium hover:no-underline">Ingredients</AccordionTrigger>
          <AccordionContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.ingredients.filter((i: any) => i.isKeyIngredient).map((ing: any) => (
                <Card key={ing.id} className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-4 flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-sm">{ing.commonName}</h4>
                      {ing.concentration && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4">{ing.concentration}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{ing.inciName}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={ing.description}>{ing.description}</p>
                    
                    <div className="flex gap-1 mt-2">
                      {ing.ewgScore && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-sm font-medium",
                          ing.ewgScore <= 2 ? "bg-green-100 text-green-800" : 
                          ing.ewgScore <= 6 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                        )}>
                          EWG: {ing.ewgScore}
                        </span>
                      )}
                      {ing.isFragrance && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800 font-medium">Fragrance</span>}
                      {ing.isComedogenic && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-red-100 text-red-800 font-medium">Comedogenic</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Accordion className="w-full">
              <AccordionItem value="full-list" className="border-none">
                <AccordionTrigger className="text-sm py-2 hover:no-underline text-muted-foreground">View Full INCI List</AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {product.ingredients.map((i: any) => i.inciName).join(', ')}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </AccordionItem>

        {/* Panel 4 — "Details & Claims" */}
        <AccordionItem value="details">
          <AccordionTrigger className="text-base font-medium hover:no-underline">Details & Storage</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">Shelf Life</div>
              <div className="font-medium">{product.shelfLifeMonths} Months</div>
              
              <div className="text-muted-foreground">Period After Opening</div>
              <div className="font-medium">{product.periodAfterOpeningMonths}M</div>
              
              <div className="text-muted-foreground col-span-2 mt-2">Storage Instructions</div>
              <div className="font-medium col-span-2">{product.storageInstructions}</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Panel 5 — "Warnings" */}
        {(product.warnings?.length > 0 || product.contraindications?.length > 0) && (
          <AccordionItem value="warnings">
            <AccordionTrigger className="text-base font-medium hover:no-underline">Warnings & Contraindications</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {product.warnings?.length > 0 && (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {product.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              )}
              {product.contraindications?.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 text-red-600">
                    <AlertTriangle className="w-4 h-4" /> Contraindications
                  </h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {product.contraindications.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Panel 6 — Category-Specific Details */}
        {product.primaryCategory === 'face' && product.faceDetails && (
          <AccordionItem value="category-details">
            <AccordionTrigger className="text-base font-medium hover:no-underline capitalize">{product.primaryCategory} Details</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {product.faceDetails.skinTypes.map((type: string) => (
                  <Badge key={type} variant="outline" className="capitalize">{type} Skin</Badge>
                ))}
                {product.faceDetails.isNonComedogenic && <Badge variant="outline">Non-comedogenic</Badge>}
                {product.faceDetails.isHypoallergenic && <Badge variant="outline">Hypoallergenic</Badge>}
                {product.faceDetails.spf && <Badge variant="outline">SPF {product.faceDetails.spf}</Badge>}
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                {product.faceDetails.acidPercentage && (
                  <>
                    <div className="text-muted-foreground">Acid Concentration</div>
                    <div className="font-medium">{product.faceDetails.acidPercentage}</div>
                  </>
                )}
                {product.faceDetails.retinoidStrength && (
                  <>
                    <div className="text-muted-foreground">Retinoid Strength</div>
                    <div className="font-medium">{product.faceDetails.retinoidStrength}</div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

      </Accordion>
    </div>
  );
};
